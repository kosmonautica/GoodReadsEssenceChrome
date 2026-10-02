# GoodReadsEssenceChrome

Chrome extension (Manifest V3) that extracts the essence of a book from a Goodreads book page and copies it to the clipboard as Markdown. The user pastes it manually into an Obsidian note, so there is no Obsidian integration. The project is at an early stage; scope and structure will be added here as they are decided.

## Workflow

1. The user opens a book page on Goodreads in Chrome.
2. The user clicks the extension icon (popup).
3. The extension loads the Markdown template from its settings and fills it with data scraped from the book page.
4. The popup shows an editable preview of the filled template with two buttons: "Copy to clipboard" (text) and "Copy with cover image" (text plus the downloaded cover).
5. The user pastes the result into Obsidian manually.

Settings: the user defines a Markdown template with placeholders that map to Goodreads data points. The available data points are determined by analysing Goodreads pages. Booksidian (https://community.obsidian.md/plugins/booksidian-plugin) is the reference for placeholder naming.

## Project status

- Working and used in Chrome: popup with preview, two copy buttons, settings page, scraper, template engine with filters, icon. Covered by Node tests.
- Open question: how Obsidian handles the HTML paste of "Copy with cover image" (image as attachment or not) is the user's to confirm. Fallbacks if it misbehaves: a cover download button, or embedding the cover as a base64 `data:` URI in the Markdown text.
- Update this file whenever a structural decision is made (build tooling, folder layout, commands).

## Architecture

Plain JavaScript, no build step, no dependencies. Do not introduce a bundler or framework without agreement.

- `manifest.json`: MV3; permissions `activeTab`, `scripting`, `storage`; hosts `https://www.goodreads.com/*` plus the Goodreads image hosts (`m.media-amazon.com`, `i.gr-assets.com`, `images.gr-assets.com`), which the popup needs to download the cover.
- `scraper.js`: injected into the book page by `popup.js` (`chrome.scripting.executeScript` with `files`). It must stay a self-contained classic script whose last expression is the result. It reads the JSON-LD block and the Next.js `__NEXT_DATA__` Apollo state (`Book:` / `Contributor:` entries), not the visual HTML, which is more stable.
- `lib/template.js`: placeholder engine (`{{name}}`, filters `join`, `default`, `wikilink`) and the list of placeholders.
- `lib/defaults.js`: default template and loading from `chrome.storage.sync`.
- `lib/markdown.js`: tiny Markdown to HTML converter (headings, bullets, images, links, bold) for the HTML clipboard flavor.
- `popup.html/js`: editable preview, "Copy to clipboard" (text) and "Copy with cover image" (text/plain plus text/html with the cover as `data:` URI). `options.html/js`: template editor (opens in its own tab, has a Close button).
- `icons/`: `icon.svg` is the source (book with "GR"); `icon-16/32/48/128.png` are rendered from it and referenced in `manifest.json`. Re-render the PNGs after changing the SVG.
- `test/`: `node --test`; fixture `test/fixtures/catcher-in-the-rye.html` is a trimmed real Goodreads page.

Goodreads data points found: JSON-LD (`name`, `image`, `numberOfPages`, `isbn`, `author`, `aggregateRating`) and Apollo `Book.details` (`publicationTime` in ms, `publisher`, `isbn13`, `language`), `Book.bookGenres`, `Book.webUrl`, `Book.imageUrl`. Book pages are readable without login. When adding a placeholder, update `scraper.js`, `PLACEHOLDERS` in `lib/template.js`, the README and the tests.

## Standing rules

- All written output is in English: code, identifiers, comments, commit messages, PR text, README and this file. The chat with the user is in German.
- Always keep `README.md` and `CLAUDE.md` up to date on your own, without being asked, whenever a change affects them. Both stay in English.
- Never mention Claude, AI, or any assistant in commit messages or PR descriptions. No `Co-Authored-By` or session trailers.

## Conventions

- Manifest V3 (service worker instead of background page, no remotely hosted code).
- Request the fewest possible permissions in `manifest.json`; restrict host access to Goodreads and its image hosts.
- No tracking and no external requests without explicit agreement.
- Keep changes small and follow the existing code style.

## Commands

- `npm test`: run the unit tests (Node 20+, no install needed).

## Testing locally

1. Open `chrome://extensions` and enable Developer mode.
2. Click "Load unpacked" and select the project (or build output) folder.
3. Reload the extension there after code changes.

Automated checks: `npm test`. A real-browser check is possible with Playwright's Chromium loading the folder as an extension. The extension has no service worker, so derive its id from the folder path (or read it from `chrome://extensions`). Goodreads blocks headless browsers with an AWS WAF challenge, so serve `test/fixtures/catcher-in-the-rye.html` via request routing instead of the live page.

## Git

- Develop on the assigned feature branch, not directly on the default branch.
- After pushing, open a pull request and merge it into `main` right away (squash merge, clean commit title). The user wants every finished change on `main` immediately, without asking again.
- Start each new change from the latest `main`; the work branch is reset to `origin/main` for that (force-with-lease is fine, its old content is already merged).
- Keep `README.md` (including the shown default template) in sync when `lib/defaults.js` changes.
