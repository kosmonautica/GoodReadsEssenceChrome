# GoodReadsEssenceChrome

A Chrome extension (Manifest V3) that extracts the essence of a book from its Goodreads page and puts it into the clipboard as Markdown, ready to be pasted manually into an Obsidian note.

> Status: first working version.

## Intended workflow

1. Browse to a book page on Goodreads in Chrome.
2. Click the extension icon.
3. The extension loads the Markdown template from its settings and fills it with the data of the book page.
4. A preview of the filled template is shown, with a "Copy to clipboard" button.
5. Paste the Markdown from the clipboard into Obsidian.

## Settings

The user defines a Markdown template in the extension settings. Placeholders map to data points of the Goodreads book page (the set of available data points is determined by analysing Goodreads). The Obsidian plugin [Booksidian](https://community.obsidian.md/plugins/booksidian-plugin) serves as a reference.

## Placeholders

`{{title}}`, `{{authors}}`, `{{publicationDate}}`, `{{publicationYear}}`, `{{rating}}`, `{{ratingsCount}}`, `{{pages}}`, `{{cover}}`, `{{url}}`, `{{isbn}}`, `{{publisher}}`, `{{language}}`, `{{genres}}`, `{{description}}`

Lists (`authors`, `genres`) are comma-separated by default. Filters: `{{authors|join:" / "}}`, `{{rating|default:"n/a"}}`, `{{authors|wikilink}}` (wraps every author, or any value, in an Obsidian `[[link]]`; characters not allowed in note names are removed).

Default template: title, cover image (Obsidian size `|300`), authors as `[[wikilinks]]` (one per author), publication date, rating, pages and the Goodreads page as a Markdown link. A template saved in the settings overrides the default; use "Reset to default" there to pick up a changed default.

## Installation (development)

1. Clone this repository.
2. Open `chrome://extensions` and enable Developer mode.
3. Click "Load unpacked" and select the project folder.

## Development

Plain JavaScript, no build step. Run the tests with `npm test` (Node 20+).

See [CLAUDE.md](CLAUDE.md) for conventions and project notes.
