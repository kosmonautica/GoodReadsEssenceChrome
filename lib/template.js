// Fills a Markdown template with book data.
// Syntax: {{name}} or {{name|filter:"arg"|filter2}}
// Filters: join:"sep" (lists), default:"text" (empty values),
// wikilink (wraps each value, or each list item, in an Obsidian [[link]])

const PLACEHOLDER = /\{\{\s*(\w+)((?:\s*\|\s*[^|}]+)*)\s*\}\}/g;

// Characters that are not allowed inside an Obsidian note name.
const INVALID_LINK_CHARS = /[\\/:*?"<>|#^[\]]/g;

function wikilink(value) {
  const one = (v) => `[[${String(v).replace(INVALID_LINK_CHARS, '').trim()}]]`;
  if (Array.isArray(value)) return value.filter(Boolean).map(one);
  return value === '' || value == null ? value : one(value);
}

function applyFilter(value, filter) {
  const m = filter.trim().match(/^(\w+)(?::"([^"]*)")?$/);
  if (!m) return value;
  const [, name, arg] = m;
  if (name === 'join') return Array.isArray(value) ? value.join(arg == null ? ', ' : arg) : value;
  if (name === 'wikilink') return wikilink(value);
  if (name === 'default') {
    const empty = value == null || value === '' || (Array.isArray(value) && !value.length);
    return empty ? arg || '' : value;
  }
  return value;
}

export function render(template, data) {
  return template.replace(PLACEHOLDER, (match, key, filters) => {
    if (!(key in data)) return match;
    let value = data[key];
    (filters.match(/\|[^|]+/g) || []).forEach((f) => {
      value = applyFilter(value, f.slice(1));
    });
    return Array.isArray(value) ? value.join(', ') : value == null ? '' : String(value);
  });
}

export const PLACEHOLDERS = [
  'title', 'authors', 'publicationDate', 'publicationYear', 'rating', 'ratingsCount',
  'pages', 'cover', 'url', 'isbn', 'publisher', 'language', 'genres', 'description',
];
