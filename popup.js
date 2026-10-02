import { render } from './lib/template.js';
import { loadTemplate } from './lib/defaults.js';
import { markdownToHtml } from './lib/markdown.js';

const $ = (id) => document.getElementById(id);

let book = null;

function showMessage(html) {
  $('message').innerHTML = html;
  $('message').hidden = false;
}

async function main() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !/^https:\/\/www\.goodreads\.com\/book\/show\//.test(tab.url || '')) {
    showMessage('Open a Goodreads book page first (www.goodreads.com/book/show/...).');
    return;
  }

  const [injection] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['scraper.js'] });
  const data = injection && injection.result;
  if (!data || !data.found) {
    showMessage(
      'No book data found on this page. If Goodreads asks you to sign in, ' +
        '<a href="https://www.goodreads.com/user/sign_in" target="_blank">sign in</a> and try again.'
    );
    return;
  }

  book = data;
  $('output').value = render(await loadTemplate(), data);
  $('preview').hidden = false;
}

$('copy').addEventListener('click', async () => {
  await navigator.clipboard.writeText($('output').value);
  $('status').textContent = 'Copied!';
});
function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

// Copies the Markdown as text/plain and an HTML version that embeds the
// downloaded cover as a data: URI, so the image travels with the text.
$('copyCover').addEventListener('click', async () => {
  const markdown = $('output').value;
  try {
    if (!book || !book.cover) throw new Error('no cover on this page');
    const response = await fetch(book.cover);
    if (!response.ok) throw new Error('cover download failed (' + response.status + ')');
    const cover = await blobToDataUrl(await response.blob());
    const html = markdownToHtml(markdown, (url) => (url === book.cover ? cover : url));
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/plain': new Blob([markdown], { type: 'text/plain' }),
        'text/html': new Blob([html], { type: 'text/html' }),
      }),
    ]);
    $('status').textContent = 'Copied with cover!';
  } catch (e) {
    $('status').textContent = 'Failed: ' + e.message;
  }
});

$('settings').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

main().catch((e) => showMessage('Error: ' + e.message));
