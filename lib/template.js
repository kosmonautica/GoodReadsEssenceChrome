// Fills a Markdown template with book data.
// Syntax: {{name}} or {{name|filter:"arg"|filter2}}
// Filters: join:"sep" (lists), default:"text" (empty values)

const PLACEHOLDER = /\{\{\s*(\w+)((?:\s*\|\s*[^|}]+)*)\s*\}\}/g;

function applyFilter(value, filter) {
  const m = filter.trim().match(/^(\w+)(?::"([^"]*)")?$/);
  if (!m) return value;
  const [, name, arg] = m;
  if (name === 'join') return Array.isArray(value) ? value.join(arg == null ? ', ' : arg) : value;
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
