import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const COMMIT_SHA_PATTERN = /^[0-9a-f]{40}$/u;
const SHA256_PATTERN = /^[0-9a-f]{64}$/u;
const GENERATOR_IMAGE_PATTERN = /^(?:sha256:[0-9a-f]{64}|[^\s@]+@sha256:[0-9a-f]{64})$/u;

export const DEFAULT_TIMEOUT_MS = 10 * 60 * 1000;
export const DEFAULT_POLL_INTERVAL_MS = 5 * 1000;
export const DEFAULT_REQUEST_TIMEOUT_MS = 15 * 1000;
export const DEFAULT_MAX_BYTES = 1024 * 1024;

function assertRecord(value, context) {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		throw new Error(context + ' must be an object');
	}
	return value;
}

function assertKnownKeys(value, allowed, context) {
	for (const key of Object.keys(value)) {
		if (!allowed.includes(key)) {
			throw new Error(context + ' has unknown property: ' + key);
		}
	}
}

export function validateCommitSha(value) {
	if (typeof value !== 'string' || !COMMIT_SHA_PATTERN.test(value)) {
		throw new Error('CF_PAGES_COMMIT_SHA must be 40 lowercase hexadecimal characters');
	}
	return value;
}

export function normalizePublicBaseUrl(value) {
	if (typeof value !== 'string' || value.trim() === '') {
		throw new Error('OGP_PUBLIC_BASE_URL is required');
	}
	let url;
	try {
		url = new URL(value);
	} catch {
		throw new Error('OGP_PUBLIC_BASE_URL must be an absolute URL');
	}
	if (
		url.protocol !== 'https:' ||
		url.username !== '' ||
		url.password !== '' ||
		(url.pathname !== '' && url.pathname !== '/') ||
		url.search !== '' ||
		url.hash !== ''
	) {
		throw new Error('OGP_PUBLIC_BASE_URL must be an HTTPS origin without credentials, path, query, or fragment');
	}
	return url.origin;
}

function validateImageId(value, context) {
	if (typeof value !== 'string') {
		throw new Error(context + ' must be a string');
	}
	let url;
	try {
		url = new URL(value);
	} catch {
		throw new Error(context + ' must be an absolute URL');
	}
	if (
		url.protocol !== 'https:' ||
		url.username !== '' ||
		url.password !== '' ||
		url.search !== '' ||
		url.hash !== '' ||
		url.toString() !== value
	) {
		throw new Error(context + ' must be a canonical HTTPS URL');
	}
}

function validateManifestImage(id, rawImage, publicBaseUrl) {
	const context = 'manifest.images[' + JSON.stringify(id) + ']';
	validateImageId(id, 'manifest image id');
	const image = assertRecord(rawImage, context);
	assertKnownKeys(image, ['key', 'url', 'renderFingerprint'], context);
	if (typeof image.renderFingerprint !== 'string' || !SHA256_PATTERN.test(image.renderFingerprint)) {
		throw new Error(context + '.renderFingerprint must be 64 lowercase hexadecimal characters');
	}
	if (typeof image.key !== 'string') {
		throw new Error(context + '.key must be a string');
	}
	const expectedKey = 'ogp/v1/' + image.renderFingerprint + '.png';
	if (image.key !== expectedKey) {
		throw new Error(context + '.key does not match renderFingerprint');
	}
	if (typeof image.url !== 'string' || image.url !== publicBaseUrl + '/' + expectedKey) {
		throw new Error(context + '.url is outside OGP_PUBLIC_BASE_URL or does not match key');
	}
}

export function validateManifest(raw, expectedCommitSha, expectedPublicBaseUrl) {
	const commitSha = validateCommitSha(expectedCommitSha);
	const publicBaseUrl = normalizePublicBaseUrl(expectedPublicBaseUrl);
	const manifest = assertRecord(raw, 'manifest');
	assertKnownKeys(manifest, ['schemaVersion', 'commitSha', 'generatorImage', 'images'], 'manifest');

	if (manifest.schemaVersion !== 1) {
		throw new Error('manifest has unsupported schemaVersion');
	}
	if (manifest.commitSha !== commitSha) {
		throw new Error('manifest commitSha does not match CF_PAGES_COMMIT_SHA');
	}
	if (typeof manifest.generatorImage !== 'string' || !GENERATOR_IMAGE_PATTERN.test(manifest.generatorImage)) {
		throw new Error('manifest generatorImage is not an immutable SHA-256 digest');
	}

	const images = assertRecord(manifest.images, 'manifest.images');
	for (const [id, rawImage] of Object.entries(images)) {
		validateManifestImage(id, rawImage, publicBaseUrl);
	}
	return manifest;
}

export async function readLimitedResponse(response, maxBytes = DEFAULT_MAX_BYTES) {
	if (!Number.isSafeInteger(maxBytes) || maxBytes <= 0) {
		throw new Error('manifest response size limit must be a positive safe integer');
	}
	const contentLength = response.headers.get('content-length');
	if (contentLength !== null) {
		if (!/^[0-9]+$/u.test(contentLength) || Number(contentLength) > maxBytes) {
			throw new Error('OGP manifest response exceeds the size limit');
		}
	}
	if (response.body === null) {
		throw new Error('OGP manifest response has no body');
	}

	const reader = response.body.getReader();
	const chunks = [];
	let total = 0;
	for (;;) {
		const { done, value } = await reader.read();
		if (done) {
			break;
		}
		total += value.byteLength;
		if (total > maxBytes) {
			await reader.cancel().catch(() => undefined);
			throw new Error('OGP manifest response exceeds the size limit');
		}
		chunks.push(value);
	}

	const bytes = new Uint8Array(total);
	let offset = 0;
	for (const chunk of chunks) {
		bytes.set(chunk, offset);
		offset += chunk.byteLength;
	}
	try {
		return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
	} catch {
		throw new Error('OGP manifest response is not valid UTF-8');
	}
}

function wait(delayMs) {
	return new Promise((resolve) => {
		setTimeout(resolve, delayMs);
	});
}

function isRetryableStatus(status) {
	return status === 404 || status === 408 || status === 425 || status === 429 || status >= 500;
}

function requestOptions(remainingMs) {
	const options = {
		headers: {
			accept: 'application/json',
			'cache-control': 'no-cache',
		},
		redirect: 'error',
	};
	if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
		options.signal = AbortSignal.timeout(Math.max(1, Math.min(DEFAULT_REQUEST_TIMEOUT_MS, remainingMs)));
	}
	return options;
}

export async function fetchManifest(options) {
	const commitSha = validateCommitSha(options.commitSha);
	const publicBaseUrl = normalizePublicBaseUrl(options.publicBaseUrl);
	const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
	const pollIntervalMs = options.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS;
	const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
	const maxAttempts = options.maxAttempts ?? Number.POSITIVE_INFINITY;
	if (!Number.isFinite(timeoutMs) || timeoutMs <= 0 || !Number.isFinite(pollIntervalMs) || pollIntervalMs < 0) {
		throw new Error('OGP manifest polling timeout and interval must be valid positive values');
	}
	if (maxAttempts !== Number.POSITIVE_INFINITY && (!Number.isSafeInteger(maxAttempts) || maxAttempts <= 0)) {
		throw new Error('OGP manifest maxAttempts must be a positive safe integer');
	}
	const fetchImpl = options.fetchImpl ?? globalThis.fetch;
	const sleep = options.sleep ?? wait;
	const now = options.now ?? Date.now;
	const nonce = options.nonce ?? Date.now().toString(36);
	const deadline = now() + timeoutMs;
	let attempt = 0;
	let lastFailure = 'manifest was not available';

	while (attempt < maxAttempts) {
		const remainingMs = deadline - now();
		if (remainingMs <= 0) {
			break;
		}
		attempt += 1;
		const manifestUrl = new URL('/manifests/v1/' + commitSha + '.json', publicBaseUrl);
		manifestUrl.searchParams.set('build', nonce);
		manifestUrl.searchParams.set('attempt', String(attempt));
		let response;
		try {
			response = await fetchImpl(manifestUrl, requestOptions(remainingMs));
		} catch (error) {
			lastFailure = error instanceof Error ? error.message : 'manifest request failed';
		}

		if (response !== undefined) {
			if (response.status === 200) {
				const source = await readLimitedResponse(response, maxBytes);
				let parsed;
				try {
					parsed = JSON.parse(source);
				} catch {
					throw new Error('OGP manifest response is not valid JSON');
				}
				return validateManifest(parsed, commitSha, publicBaseUrl);
			}
			if (response.body !== null && response.body !== undefined) {
				await response.body.cancel().catch(() => undefined);
			}
			if (!isRetryableStatus(response.status)) {
				throw new Error('OGP manifest request failed with HTTP ' + response.status);
			}
			lastFailure = 'HTTP ' + response.status;
		}

		const waitMs = Math.min(pollIntervalMs, Math.max(0, deadline - now()));
		if (attempt >= maxAttempts || waitMs <= 0) {
			break;
		}
		if (attempt === 1 || attempt % 6 === 0) {
			console.log(
				'Waiting for OGP manifest commit=' +
					commitSha +
					' attempt=' +
					attempt +
					' last=' +
					lastFailure,
			);
		}
		await sleep(waitMs);
	}

	throw new Error('OGP manifest was not available within ' + timeoutMs + ' ms: ' + lastFailure);
}

export function runHugo(command, environment) {
	return new Promise((resolve, reject) => {
		const child = spawn(command, ['--environment', 'production', '--printPathWarnings'], {
			env: environment,
			stdio: 'inherit',
		});
		child.once('error', reject);
		child.once('exit', (code, signal) => {
			if (code === 0) {
				resolve();
				return;
			}
			reject(new Error('Hugo build failed with ' + (signal === null ? 'exit code ' + code : 'signal ' + signal)));
		});
	});
}

export async function main(environment = process.env) {
	const commitSha = validateCommitSha(environment.CF_PAGES_COMMIT_SHA);
	const publicBaseUrl = normalizePublicBaseUrl(environment.OGP_PUBLIC_BASE_URL);
	const manifest = await fetchManifest({ commitSha, publicBaseUrl });
	const dataPath = path.resolve(process.cwd(), 'data', 'ogp_manifest.json');
	let created = false;
	try {
		await mkdir(path.dirname(dataPath), { recursive: true });
		await writeFile(dataPath, JSON.stringify(manifest, null, 2) + '\n', {
			encoding: 'utf8',
			flag: 'wx',
		});
		created = true;
		console.log('Validated OGP manifest commit=' + commitSha + ' images=' + Object.keys(manifest.images).length);
		await runHugo(environment.HUGO_BIN || 'hugo', environment);
	} finally {
		if (created) {
			await rm(dataPath, { force: true });
		}
	}
}

const isMain =
	process.argv[1] !== undefined && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
	main().catch((error) => {
		const message = error instanceof Error ? error.message : 'unknown error';
		console.error('OGP Pages build failed: ' + message);
		process.exitCode = 1;
	});
}
