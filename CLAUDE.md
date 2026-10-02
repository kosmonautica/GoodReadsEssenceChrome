# GoodReadsEssenceChrome

Chrome extension (Manifest V3) that extracts the essence of a book from a Goodreads book page and copies it to the clipboard as Markdown. The user pastes it manually into an Obsidian note, so there is no Obsidian integration. The project is at an early stage; scope and structure will be added here as they are decided.

## Workflow

1. The user opens a book page on Goodreads in Chrome.
2. The user clicks the extension icon (popup).
3. The extension loads the Markdown template from its settings and fills it with data scraped from the book page.
4. The popup shows a preview of the filled template with a "Copy to clipboard" button.
5. The user pastes the result into Obsidian manually.

Settings: the user defines a Markdown template with placeholders that map to Goodreads data points. The available data points are determined by analysing Goodreads pages. Booksidian (https://community.obsidian.md/plugins/booksidian-plugin) is the reference for placeholder naming.

## Project status

- First working version exists (popup, settings, scraper, template engine). It is covered by Node tests but has not been loaded in a real Chrome yet. No icons yet.
- Update this file whenever a structural decision is made (build tooling, folder layout, commands).

## Architecture

Plain JavaScript, no build step, no dependencies. Do not introduce a bundler or framework without agreement.

- `manifest.json`: MV3; permissions `activeTab`, `scripting`, `storage`; host `https://www.goodreads.com/*`.
- `scraper.js`: injected into the book page by `popup.js` (`chrome.scripting.executeScript` with `files`). It must stay a self-contained classic script whose last expression is the result. It reads the JSON-LD block and the Next.js `__NEXT_DATA__` Apollo state (`Book:` / `Contributor:` entries), not the visual HTML, which is more stable.
- `lib/template.js`: placeholder engine (`{{name}}`, filters `join`, `default`, `wikilink`) and the list of placeholders.
- `lib/defaults.js`: default template and loading from `chrome.storage.sync`.
- `popup.html/js`: editable preview and "Copy to clipboard". `options.html/js`: template editor (opens in its own tab, has a Close button).
- `test/`: `node --test`; fixture `test/fixtures/catcher-in-the-rye.html` is a trimmed real Goodreads page.

Goodreads data points found: JSON-LD (`name`, `image`, `numberOfPages`, `isbn`, `author`, `aggregateRating`) and Apollo `Book.details` (`publicationTime` in ms, `publisher`, `isbn13`, `language`), `Book.bookGenres`, `Book.webUrl`, `Book.imageUrl`. Book pages are readable without login. When adding a placeholder, update `scraper.js`, `PLACEHOLDERS` in `lib/template.js`, the README and the tests.

## Standing rules

- All written output is in English: code, identifiers, comments, commit messages, PR text, README and this file. The chat with the user is in German.
- Always keep `README.md` and `CLAUDE.md` up to date on your own, without being asked, whenever a change affects them. Both stay in English.
- Never mention Claude, AI, or any assistant in commit messages or PR descriptions. No `Co-Authored-By` or session trailers.

## Conventions

- Manifest V3 (service worker instead of background page, no remotely hosted code).
- Request the fewest possible permissions in `manifest.json`; restrict host access to Goodreads domains (`https://www.goodreads.com/*`).
- No tracking and no external requests without explicit agreement.
- Keep changes small and follow the existing code style.

## Commands

- `npm test`: run the unit tests (Node 20+, no install needed).

## Testing locally

1. Open `chrome://extensions` and enable Developer mode.
2. Click "Load unpacked" and select the project (or build output) folder.
3. Reload the extension there after code changes.

## Git

- Develop on the assigned feature branch, not directly on the default branch.
- After pushing, open a draft pull request.
