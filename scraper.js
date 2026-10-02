// Injected into a Goodreads book page. Reads the structured data embedded in
// the page (JSON-LD and Next.js state) and returns a plain object.
// The value of the last expression is what chrome.scripting.executeScript returns.
function extractBook(doc, pageUrl) {
  const json = (selector) => {
    const el = doc.querySelector(selector);
    if (!el) return null;
    try {
      return JSON.parse(el.textContent);
    } catch (e) {
      return null;
    }
  };

  const ld = json('script[type="application/ld+json"]') || {};
  const next = json('script#__NEXT_DATA__');
  const pageProps = (next && next.props && next.props.pageProps) || {};
  const state = pageProps.apolloState || {};
  const entries = (prefix) => Object.keys(state).filter((k) => k.startsWith(prefix)).map((k) => state[k]);

  const bookId = parseInt(pageProps.params && pageProps.params.book_id, 10);
  const books = entries('Book:');
  const book = books.find((b) => b.legacyId === String(bookId)) || books[0] || {};
  const details = book.details || {};

  const authors = [];
  const edge = book.primaryContributorEdge;
  const primary = edge && edge.node && state[edge.node.__ref];
  if (primary && primary.name) authors.push(primary.name);
  (book.secondaryContributorEdges || []).forEach((e) => {
    const c = e && e.node && state[e.node.__ref];
    if (c && c.name && !authors.includes(c.name)) authors.push(c.name);
  });
  if (!authors.length && Array.isArray(ld.author)) {
    ld.author.forEach((a) => a && a.name && authors.push(a.name));
  }

  const rating = ld.aggregateRating || {};
  const published = details.publicationTime ? new Date(details.publicationTime).toISOString().slice(0, 10) : '';

  const data = {
    title: book.title || ld.name || '',
    authors: authors,
    publicationDate: published,
    publicationYear: published.slice(0, 4),
    rating: rating.ratingValue != null ? rating.ratingValue : '',
    ratingsCount: rating.ratingCount != null ? rating.ratingCount : '',
    pages: details.numPages != null ? details.numPages : ld.numberOfPages != null ? ld.numberOfPages : '',
    cover: book.imageUrl || ld.image || '',
    url: book.webUrl || pageUrl || '',
    isbn: details.isbn13 || details.isbn || ld.isbn || '',
    publisher: details.publisher || '',
    language: (details.language && details.language.name) || ld.inLanguage || '',
    genres: (book.bookGenres || []).map((g) => g && g.genre && g.genre.name).filter(Boolean),
    description: book['description({"stripped":true})'] || book.description || '',
  };
  data.found = Boolean(data.title);
  return data;
}

typeof document !== 'undefined' ? extractBook(document, location.href) : undefined;
