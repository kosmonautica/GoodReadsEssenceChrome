import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { render } from '../lib/template.js';
import { DEFAULT_TEMPLATE } from '../lib/defaults.js';

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
