import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	fetchManifest,
	normalizePublicBaseUrl,
	readLimitedResponse,
	validateManifest,
} from './build-pages.mjs';

const COMMIT_SHA = 'a'.repeat(40);
const FINGERPRINT = 'b'.repeat(64);
const GENERATOR_DIGEST = 'c'.repeat(64);
const ID = 'https://example.com/articles/example/';
const PUBLIC_BASE_URL = 'https://og.example.com';

function validManifest() {
	return {
		schemaVersion: 1,
		commitSha: COMMIT_SHA,
		generatorImage: 'registry.example/ogp@sha256:' + GENERATOR_DIGEST,
		images: {
			[ID]: {
				key: 'ogp/v1/' + FINGERPRINT + '.png',
				url: PUBLIC_BASE_URL + '/ogp/v1/' + FINGERPRINT + '.png',
				renderFingerprint: FINGERPRINT,
			},
		},
	};
}

describe('normalizePublicBaseUrl', () => {
	it('accepts an HTTPS origin', () => {
		assert.equal(normalizePublicBaseUrl(PUBLIC_BASE_URL + '/'), PUBLIC_BASE_URL);
	});

	it('rejects paths and insecure origins', () => {
		assert.throws(() => normalizePublicBaseUrl('http://og.example.com'), /HTTPS origin/u);
		assert.throws(() => normalizePublicBaseUrl(PUBLIC_BASE_URL + '/prefix'), /HTTPS origin/u);
	});
});

describe('validateManifest', () => {
	it('accepts a manifest tied to the expected commit and origin', () => {
		assert.deepEqual(validateManifest(validManifest(), COMMIT_SHA, PUBLIC_BASE_URL), validManifest());
	});

	it('rejects a different commit', () => {
		const manifest = validManifest();
		manifest.commitSha = 'd'.repeat(40);
		assert.throws(
			() => validateManifest(manifest, COMMIT_SHA, PUBLIC_BASE_URL),
			/does not match CF_PAGES_COMMIT_SHA/u,
		);
	});

	it('rejects a foreign image origin', () => {
		const manifest = validManifest();
		manifest.images[ID].url = 'https://attacker.example/ogp/v1/' + FINGERPRINT + '.png';
		assert.throws(
			() => validateManifest(manifest, COMMIT_SHA, PUBLIC_BASE_URL),
			/outside OGP_PUBLIC_BASE_URL/u,
		);
	});

	it('rejects mismatched keys and incomplete entries', () => {
		const mismatched = validManifest();
		mismatched.images[ID].key = 'ogp/v1/' + 'd'.repeat(64) + '.png';
		assert.throws(
			() => validateManifest(mismatched, COMMIT_SHA, PUBLIC_BASE_URL),
			/\.key does not match renderFingerprint/u,
		);

		const incomplete = validManifest();
		delete incomplete.images[ID].url;
		assert.throws(
			() => validateManifest(incomplete, COMMIT_SHA, PUBLIC_BASE_URL),
			/\.url is outside OGP_PUBLIC_BASE_URL/u,
		);
	});
});

describe('readLimitedResponse', () => {
	it('rejects a body that exceeds the configured limit', async () => {
		const response = new Response(new Uint8Array(1025));
		await assert.rejects(readLimitedResponse(response, 1024), /exceeds the size limit/u);
	});
});

describe('fetchManifest', () => {
	it('retries a missing manifest and validates the winner', async () => {
		let requests = 0;
		let sleeps = 0;
		let cancellations = 0;
		const manifest = await fetchManifest({
			commitSha: COMMIT_SHA,
			publicBaseUrl: PUBLIC_BASE_URL,
			timeoutMs: 1_000,
			pollIntervalMs: 1,
			nonce: 'test',
			now: () => 0,
			sleep: async () => {
				sleeps += 1;
			},
			fetchImpl: async () => {
				requests += 1;
				if (requests === 1) {
					return {
						status: 404,
						body: {
							cancel: async () => {
								cancellations += 1;
							},
						},
					};
				}
				return new Response(JSON.stringify(validManifest()), {
					status: 200,
					headers: { 'content-type': 'application/json' },
				});
			},
		});
		assert.equal(requests, 2);
		assert.equal(sleeps, 1);
		assert.equal(cancellations, 1);
		assert.equal(manifest.commitSha, COMMIT_SHA);
	});

	it('fails immediately when an available manifest is invalid', async () => {
		let requests = 0;
		let sleeps = 0;
		const invalid = validManifest();
		invalid.commitSha = 'd'.repeat(40);
		await assert.rejects(
			fetchManifest({
				commitSha: COMMIT_SHA,
				publicBaseUrl: PUBLIC_BASE_URL,
				timeoutMs: 1_000,
				pollIntervalMs: 1,
				maxAttempts: 3,
				nonce: 'test-invalid',
				now: () => 0,
				sleep: async () => {
					sleeps += 1;
				},
				fetchImpl: async () => {
					requests += 1;
					return new Response(JSON.stringify(invalid), { status: 200 });
				},
			}),
			/does not match CF_PAGES_COMMIT_SHA/u,
		);
		assert.equal(requests, 1);
		assert.equal(sleeps, 0);
	});
});
