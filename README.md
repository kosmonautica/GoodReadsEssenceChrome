# GoodReadsEssenceChrome

A Chrome extension (Manifest V3) that extracts the essence of a book from its Goodreads page and puts it into the clipboard as Markdown, ready to be pasted manually into an Obsidian note.

> Status: working. Used in Chrome with Obsidian.

## Workflow

1. Browse to a book page on Goodreads in Chrome.
2. Click the extension icon.
3. The extension loads the Markdown template from its settings and fills it with the data of the book page.
4. A preview of the filled template is shown (editable), with two buttons: "Copy to clipboard" (Markdown text, the cover stays a link to the Goodreads image) and "Copy with cover image" (the cover is downloaded and travels with the text, see below).
5. Paste the Markdown from the clipboard into Obsidian.

## Template

The note is built from a Markdown template that you edit in the extension settings (right-click the icon, "Options", or the "Settings" link in the popup). Everything outside `{{...}}` is copied as is, so you can use any Markdown, including Obsidian syntax such as frontmatter or `[[wikilinks]]`. A template saved in the settings overrides the default; "Reset to default" restores it. Placeholder naming is loosely based on the Obsidian plugin [Booksidian](https://community.obsidian.md/plugins/booksidian-plugin).

### Default template

```markdown
# {{title}}

![cover|300]({{cover}})

- **Author:** {{authors|wikilink}}
- **Published:** {{publicationDate}}
- **Rating:** {{rating}}
- **Pages:** {{pages}}
- **URL Goodreads:** [{{title}}]({{url}})
- **Auf das Buch gestoßen durch:** 
- **Erinnert mich an:** 
```

- `![cover|300](...)` is Obsidian's syntax for an image 300 px wide. Change the number to resize it.
- `{{authors|wikilink}}` links every author separately, e.g. `[[Terry Pratchett]], [[Neil Gaiman]]`.
- The last two lines have no placeholder. They are filled in manually after pasting.

Result for [The Catcher in the Rye](https://www.goodreads.com/book/show/5107.The_Catcher_in_the_Rye):

```markdown
# The Catcher in the Rye

![cover|300](https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1398034300i/5107.jpg)

- **Author:** [[J.D. Salinger]]
- **Published:** 2001-01-30
- **Rating:** 3.8
- **Pages:** 277
- **URL Goodreads:** [The Catcher in the Rye](https://www.goodreads.com/book/show/5107.The_Catcher_in_the_Rye)
- **Auf das Buch gestoßen durch:** 
- **Erinnert mich an:** 
```

### Placeholders

| Placeholder | Content |
| --- | --- |
| `{{title}}` | Book title |
| `{{authors}}` | Authors (list) |
| `{{publicationDate}}` | Publication date of the displayed edition, `YYYY-MM-DD` |
| `{{publicationYear}}` | Year of `publicationDate` |
| `{{rating}}` | Average Goodreads rating |
| `{{ratingsCount}}` | Number of ratings |
| `{{pages}}` | Number of pages |
| `{{cover}}` | URL of the cover image |
| `{{url}}` | URL of the Goodreads book page |
| `{{isbn}}` | ISBN-13 (falls back to ISBN-10) |
| `{{publisher}}` | Publisher |
| `{{language}}` | Language |
| `{{genres}}` | Genres (list) |
| `{{description}}` | Book description as plain text |

A placeholder without data renders as an empty string. Unknown placeholders are left untouched.

### Filters

Filters are appended with `|` and can be chained, e.g. `{{authors|wikilink|join:" & "}}`.

| Filter | Effect |
| --- | --- |
| `join:"sep"` | Joins a list with `sep` (lists are joined with `, ` by default) |
| `default:"text"` | Uses `text` if the value is empty, e.g. `{{rating\|default:"n/a"}}` |
| `wikilink` | Wraps the value, or every list item, in an Obsidian `[[link]]`; characters not allowed in note names (`\ / : * ? " < > \| # ^ [ ]`) are removed |

## Copy with cover image

The button downloads the cover and writes two flavors to the clipboard: `text/plain` (the Markdown as shown) and `text/html` (the same content with the cover embedded as a `data:` image). Whether an image is created in the Obsidian vault depends on how Obsidian handles the paste, so try it out. If it does not work for you, use "Copy to clipboard" instead. This needs access to the Goodreads image hosts (`m.media-amazon.com`, `i.gr-assets.com`, `images.gr-assets.com`).

The default template also contains two lines without placeholders (`Auf das Buch gestoßen durch:` and `Erinnert mich an:`) that are filled in manually after pasting.

## Installation

The extension is not in the Chrome Web Store; it is loaded as an unpacked extension.

1. Get the code: `git clone https://github.com/kosmonautica/GoodReadsEssenceChrome.git`, or download the ZIP of the `main` branch from GitHub and unpack it. Keep the folder where it is; Chrome loads the extension from it.
2. Open `chrome://extensions` and enable "Developer mode" (top right).
3. Click "Load unpacked" and select the folder that contains `manifest.json`.
4. Optional: pin "GoodReads Essence" via the puzzle icon in the toolbar.

## Usage

1. Open a Goodreads book page (`https://www.goodreads.com/book/show/...`).
2. Click the extension icon. The popup shows the filled template; you can edit the text before copying.
3. Click "Copy to clipboard" (or "Copy with cover image") and paste into Obsidian.

If the popup reports that no book data was found, make sure you are on a book page. If Goodreads asks you to sign in, sign in and try again.

## Updating

Pull or download the new version into the same folder, then click the reload icon of the extension on `chrome://extensions`. Chrome may ask for new permissions when they changed. A template saved in the settings is kept; use "Reset to default" there to pick up a changed default template.

## Troubleshooting

Errors of the extension are listed under "Errors" on its card at `chrome://extensions`. For the popup, right-click it and choose "Inspect" to open its console.

## Development

Plain JavaScript, no build step. Run the tests with `npm test` (Node 20+).

See [CLAUDE.md](CLAUDE.md) for conventions and project notes.
