import { render } from './lib/template.js';
import { loadTemplate } from './lib/defaults.js';

const $ = (id) => document.getElementById(id);

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

  $('output').value = render(await loadTemplate(), data);
  $('preview').hidden = false;
}

$('copy').addEventListener('click', async () => {
  await navigator.clipboard.writeText($('output').value);
  $('status').textContent = 'Copied!';
});
$('settings').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

main().catch((e) => showMessage('Error: ' + e.message));
