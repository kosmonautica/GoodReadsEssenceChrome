import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { render } from '../lib/template.js';
import { DEFAULT_TEMPLATE } from '../lib/defaults.js';
import { markdownToHtml } from '../lib/markdown.js';

const html = fs.readFileSync(new URL('./fixtures/catcher-in-the-rye.html', import.meta.url), 'utf8');
const scraperSource = fs.readFileSync(new URL('../scraper.js', import.meta.url), 'utf8');

// Minimal stand-in for `document`: finds <script> elements by selector.
const fakeDocument = {
  querySelector(selector) {
    const re =
      selector === 'script#__NEXT_DATA__'
        ? /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/
        : /<script type="application\/ld\+json">([\s\S]*?)<\/script>/;
    const m = html.match(re);
    return m ? { textContent: m[1] } : null;
  },
};

const book = vm.runInNewContext(`${scraperSource}\nextractBook(document, 'https://x')`, { document: fakeDocument, location: { href: 'https://x' } });

test('scraper extracts the default data points', () => {
  assert.equal(book.found, true);
  assert.equal(book.title, 'The Catcher in the Rye');
  assert.equal(JSON.stringify(book.authors), '["J.D. Salinger"]');
  assert.equal(book.publicationDate, '2001-01-30');
  assert.equal(book.rating, 3.8);
  assert.equal(book.pages, 277);
  assert.match(book.cover, /^https:\/\/.*5107\.jpg$/);
  assert.equal(book.url, 'https://www.goodreads.com/book/show/5107.The_Catcher_in_the_Rye');
});

test('scraper reports missing data', () => {
  const empty = vm.runInNewContext(`${scraperSource}\nextractBook(document, '')`, { document: { querySelector: () => null }, location: { href: '' } });
  assert.equal(empty.found, false);
});

test('default template renders all data points', () => {
  const out = render(DEFAULT_TEMPLATE, book);
  assert.match(out, /^# The Catcher in the Rye/);
  assert.match(out, /!\[cover\|300\]\(https:\/\/.*5107\.jpg\)/);
  assert.match(out, /\*\*Author:\*\* \[\[J\.D\. Salinger\]\]/);
  assert.match(out, /\*\*URL Goodreads:\*\* \[The Catcher in the Rye\]\(https:\/\/www\.goodreads\.com\/book\/show\/5107\.The_Catcher_in_the_Rye\)/);
  assert.match(out, /\*\*Pages:\*\* 277/);
  assert.match(out, /^- \*\*Auf das Buch gestoßen durch:\*\* $/m);
  assert.match(out, /^- \*\*Erinnert mich an:\*\* $/m);
  assert.doesNotMatch(out, /\{\{/);
});

test('filters and unknown placeholders', () => {
  assert.equal(render('{{authors|join:" / "}}', { authors: ['A', 'B'] }), 'A / B');
  assert.equal(render('{{x|default:"n/a"}}', { x: '' }), 'n/a');
  assert.equal(render('{{nope}}', {}), '{{nope}}');
});

test('wikilink filter links every author separately', () => {
  assert.equal(render('{{authors|wikilink}}', { authors: ['Terry Pratchett', 'Neil Gaiman'] }), '[[Terry Pratchett]], [[Neil Gaiman]]');
  assert.equal(render('{{authors|wikilink|join:" & "}}', { authors: ['A', 'B'] }), '[[A]] & [[B]]');
  assert.equal(render('{{title|wikilink}}', { title: 'What: Is/This?' }), '[[What IsThis]]');
  assert.equal(render('{{authors|wikilink}}', { authors: [] }), '');
});

test('markdownToHtml embeds the cover and converts the default template', () => {
  const md = render(DEFAULT_TEMPLATE, book);
  const html = markdownToHtml(md, (url) => (url === book.cover ? 'data:image/jpeg;base64,AAAA' : url));
  assert.match(html, /<h1>The Catcher in the Rye<\/h1>/);
  assert.match(html, /<img src="data:image\/jpeg;base64,AAAA" alt="cover" width="300">/);
  assert.match(html, /<li><b>Author:<\/b> \[\[J\.D\. Salinger\]\]<\/li>/);
  assert.match(html, /<a href="https:\/\/www\.goodreads\.com\/book\/show\/5107[^"]*">The Catcher in the Rye<\/a>/);
  assert.equal((html.match(/<ul>/g) || []).length, 1);
});

test('markdownToHtml escapes HTML', () => {
  assert.equal(markdownToHtml('<script>x</script>'), '<p>&lt;script&gt;x&lt;/script&gt;</p>');
});

test('README shows the current default template', () => {
  const readme = fs.readFileSync(new URL('../README.md', import.meta.url), 'utf8');
  assert.ok(readme.includes('```markdown\n' + DEFAULT_TEMPLATE + '```'), 'README default template is out of date');
});
