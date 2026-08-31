import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

// [new] Render a disposable site to test Hugo behavior, without touching either consumer.
const themeRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const baseURL = 'https://example.org/';
const pages = [
	['posts/alpha', { date: '2025-01-05', tags: ['sample'], thumbnail: 'hero.jpg', image: 'other.jpg' }],
	['posts/bravo', { date: '2025-01-04', tags: ['sample'], image: 'hero.jpg', title: 'Image "</script>" & title' }],
	['posts/plain', { date: '2025-01-03', tags: ['sample'] }],
	['posts/hidden', { date: '2025-01-02', sitemap: { disable: true } }],
	['posts/nested/child', { date: '2025-01-01' }],
	['notes/static', { date: '2024-12-31', image: 'images/static.jpg' }],
];
let work;
let site;
let builds = 0;

function write(path, content) {
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, content);
}

function writePage(path, params) {
	write(join(site, 'content', path, 'index.md'), JSON.stringify({ title: path, ...params }) + '\n\nTest content.\n');
}

function build(overrides = {}, expectFailure = false) {
	const destination = join(work, `build-${++builds}`);
	const config = {
		baseURL,
		title: 'Metadata test',
		theme: basename(themeRoot),
		themesDir: dirname(themeRoot),
		resourceDir: join(work, 'resources'),
		defaultContentLanguage: 'ja',
		languages: { ja: { locale: 'ja-jp' } },
		pagination: { pagerSize: 2 },
		outputs: { home: ['HTML', 'RSS'], page: ['HTML'] },
		...overrides,
	};
	const configPath = join(work, `config-${builds}.json`);
	write(configPath, JSON.stringify(config));
	const result = spawnSync('hugo', [
		'--source', site, '--config', configPath, '--destination', destination,
		'--cacheDir', join(work, 'cache'), '--noBuildLock', '--environment', 'production',
	], { encoding: 'utf8', timeout: 60_000 });
	assert.ifError(result.error);
	const log = result.stdout + result.stderr;
	if (expectFailure) {
		assert.notEqual(result.status, 0, 'Expected Hugo to reject invalid metadata');
		return log;
	}
	assert.equal(result.status, 0, log);
	return {
		read: (path) => readFileSync(join(destination, path), 'utf8'),
		exists: (path) => existsSync(join(destination, path)),
	};
}

function decode(value) {
	return value.replaceAll('&amp;', '&').replaceAll('&quot;', '"')
		.replace(/&#(x[\da-f]+|\d+);/giu, (_, code) => String.fromCodePoint(code[0].toLowerCase() === 'x' ? parseInt(code.slice(1), 16) : Number(code)));
}

function attribute(html, tag, key, value, resultKey) {
	const matches = [...html.matchAll(new RegExp(`<${tag}\\b([^>]+)>`, 'gu'))]
		.map((match) => Object.fromEntries([...match[1].matchAll(/([\w:-]+)="([^"]*)"/gu)]
			.map((attr) => [attr[1], decode(attr[2])])))
		.filter((attrs) => attrs[key] === value);
	assert.equal(matches.length, 1, `Expected one ${tag} with ${key}=${value}`);
	return matches[0][resultKey];
}

const canonical = (html) => attribute(html, 'link', 'rel', 'canonical', 'href');
const ogImage = (html) => attribute(html, 'meta', 'property', 'og:image', 'content');
const twitterImage = (html) => attribute(html, 'meta', 'name', 'twitter:image', 'content');
const favicon = (html) => attribute(html, 'link', 'rel', 'shortcut icon', 'href');
const articleLinks = (html) => [...html.matchAll(/<article class="li">\s*<a href="([^"]+)"/gu)].map((match) => match[1]);

function articleData(html) {
	const values = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gu)]
		.map((match) => JSON.parse(match[1])).filter((value) => value['@type'] === 'BlogPosting');
	assert.equal(values.length, 1);
	return values[0];
}

const catalogConfig = {
	outputFormats: { OGPCatalog: { mediaType: 'application/json', baseName: 'ogp-catalog', isPlainText: true, notAlternative: true } },
	outputs: { home: ['HTML', 'RSS', 'OGPCatalog'], page: ['HTML'] },
};

describe('theme metadata rendered by Hugo Extended', () => {
	let output;
	before(() => {
		work = mkdtempSync(join(tmpdir(), 'robust-iniwa-metadata-'));
		site = join(work, 'site');
		for (const [path, params] of pages) writePage(path, params);
		write(join(site, 'content/posts/nested/_index.md'), JSON.stringify({ title: 'Nested section', date: '2025-01-06' }) + '\n');
		for (const path of [
			'content/posts/alpha/hero.jpg', 'content/posts/alpha/other.jpg', 'content/posts/bravo/hero.jpg',
			'static/images/static.jpg', 'static/images/author.jpg', 'static/images/fallback.jpg', 'static/images/logo.jpg',
		]) {
			mkdirSync(dirname(join(site, path)), { recursive: true });
			copyFileSync(join(themeRoot, 'static/images/default.jpg'), join(site, path));
		}
		write(join(site, 'static/images/custom.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>');
		output = build();
	});
	after(() => {
		if (!work) return;
		const location = relative(tmpdir(), work);
		assert.ok(!isAbsolute(location) && !location.startsWith('..') && basename(work).startsWith('robust-iniwa-metadata-'));
		rmSync(work, { recursive: true, force: true });
	});

	it('uses each pager URL without adding nested sections to the article collection', () => {
		for (const path of ['', 'page/2/', 'page/3/', 'posts/', 'posts/page/2/', 'tags/sample/', 'tags/sample/page/2/', 'tags/', 'posts/alpha/']) {
			assert.equal(canonical(output.read(path + 'index.html')), baseURL + path);
		}
		assert.deepEqual(articleLinks(output.read('index.html')), ['posts/alpha/', 'posts/bravo/'].map((path) => baseURL + path));
		assert.deepEqual(articleLinks(output.read('posts/page/2/index.html')), ['posts/plain/', 'posts/hidden/'].map((path) => baseURL + path));
		assert.equal(output.exists('posts/page/3/index.html'), false);
	});

	it('keeps the baseURL subdirectory and custom pagination path', () => {
		const subsite = build({ baseURL: baseURL + 'blog/', pagination: { pagerSize: 2, path: 'p' } });
		for (const path of ['', 'p/2/', 'posts/p/2/', 'tags/sample/p/2/']) {
			assert.equal(canonical(subsite.read(path + 'index.html')), baseURL + 'blog/' + path);
		}
		assert.equal(favicon(subsite.read('index.html')), '/blog/images/favicon.ico');
	});

	it('respects sitemap.disable while keeping the page itself available', () => {
		const sitemap = output.read('sitemap.xml');
		assert.ok(output.exists('posts/hidden/index.html'));
		assert.ok(!sitemap.includes(baseURL + 'posts/hidden/'));
		assert.ok(sitemap.includes(baseURL + 'posts/plain/'));
		assert.ok(!sitemap.includes(baseURL + 'tags/'));
	});

	it('uses a shipped default image and omits an unconfigured publisher logo', () => {
		for (const path of ['index.html', 'posts/index.html', 'posts/plain/index.html']) {
			assert.equal(ogImage(output.read(path)), baseURL + 'images/default.jpg');
			assert.equal(twitterImage(output.read(path)), baseURL + 'images/default.jpg');
		}
		assert.ok(output.exists('images/default.jpg'));
		const data = articleData(output.read('posts/plain/index.html'));
		assert.equal(data.image.url, baseURL + 'images/default.jpg');
		assert.equal(Object.hasOwn(data.publisher, 'logo'), false);
		assert.equal(favicon(output.read('index.html')), '/images/favicon.ico');
	});

	it('resolves both bundle image parameters and preserves thumbnail priority and JSON escaping', () => {
		for (const path of ['posts/alpha/', 'posts/bravo/']) {
			const html = output.read(path + 'index.html');
			assert.equal(ogImage(html), baseURL + path + 'hero.jpg');
			assert.equal(twitterImage(html), ogImage(html));
			assert.equal(articleData(html).image.url, ogImage(html));
		}
		assert.equal(articleData(output.read('posts/bravo/index.html')).headline, pages[1][1].title);
		assert.equal(ogImage(output.read('notes/static/index.html')), baseURL + 'images/static.jpg');
	});

	it('honors configured default images, logos and relative or absolute favicons', () => {
		const params = { author: { thumbnail: 'images/author.jpg' }, default_thumbnail: 'images/fallback.jpg', favicon: 'images/custom.svg' };
		const configured = build({ params });
		assert.equal(ogImage(configured.read('index.html')), baseURL + 'images/author.jpg');
		assert.equal(articleData(configured.read('posts/plain/index.html')).image.url, baseURL + 'images/fallback.jpg');
		assert.equal(articleData(configured.read('posts/plain/index.html')).publisher.logo.url, baseURL + 'images/author.jpg');
		assert.equal(favicon(configured.read('index.html')), '/images/custom.svg');
		const override = build({ params: { ...params, publisher_logo: '/images/logo.jpg', favicon: 'https://assets.example.org/icon.svg' } });
		assert.equal(articleData(override.read('posts/plain/index.html')).publisher.logo.url, baseURL + 'images/logo.jpg');
		assert.equal(favicon(override.read('index.html')), 'https://assets.example.org/icon.svg');
	});

	it('passes bundle image URLs to the Worker but leaves the background empty when unset', () => {
		const worker = build({ params: { og_worker_url: 'https://og.example.org/render' } });
		assert.equal(new URL(ogImage(worker.read('posts/bravo/index.html'))).searchParams.get('bg'), baseURL + 'posts/bravo/hero.jpg');
		assert.equal(new URL(ogImage(worker.read('posts/plain/index.html'))).searchParams.get('bg'), '');
		const local = build({ baseURL: 'http://localhost:1313/', params: { og_worker_url: 'https://og.example.org/render' } });
		assert.equal(new URL(ogImage(local.read('posts/bravo/index.html'))).searchParams.get('bg'), '');
	});

	it('resolves bundle image sources in the catalog and still rejects remote backgrounds', () => {
		const catalog = JSON.parse(build(catalogConfig).read('ogp-catalog.json'));
		assert.equal(catalog.schemaVersion, 1);
		const entry = (path) => catalog.articles.find((article) => article.id === baseURL + path + '/');
		assert.equal(entry('posts/alpha').background, 'content/posts/alpha/hero.jpg');
		assert.equal(entry('posts/bravo').background, 'content/posts/bravo/hero.jpg');
		assert.equal(entry('notes/static').background, 'static/images/static.jpg');
		assert.equal(Object.hasOwn(entry('posts/plain'), 'background'), false);
		try {
			writePage('notes/static', { ...pages[5][1], image: 'https://remote.example.org/image.jpg' });
			assert.match(build(catalogConfig, true), /OGP catalog only supports local thumbnail\/image paths/u);
		} finally {
			writePage(...pages[5]);
		}
	});

	it('retains manifest precedence and fails on an incomplete or insecure manifest', () => {
		const images = Object.fromEntries(pages.map(([path]) => [baseURL + path + '/', { url: 'https://og.example.org/generated.png' }]));
		const manifest = join(site, 'data/ogp_manifest.json');
		try {
			write(manifest, JSON.stringify({ schemaVersion: 1, images }));
			const generated = build({ params: { og_worker_url: 'https://og.example.org/render' } });
			assert.equal(ogImage(generated.read('posts/bravo/index.html')), 'https://og.example.org/generated.png');
			assert.equal(twitterImage(generated.read('posts/bravo/index.html')), 'https://og.example.org/generated.png');
			delete images[baseURL + 'posts/bravo/'];
			write(manifest, JSON.stringify({ schemaVersion: 1, images }));
			assert.match(build({}, true), /OGP manifest has no entry/u);
			images[baseURL + 'posts/bravo/'] = { url: 'http://og.example.org/generated.png' };
			write(manifest, JSON.stringify({ schemaVersion: 1, images }));
			assert.match(build({}, true), /invalid HTTPS URL/u);
		} finally {
			rmSync(manifest, { force: true });
		}
	});
});
