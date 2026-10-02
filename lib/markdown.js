// Minimal Markdown to HTML converter for the clipboard's text/html flavor.
// Supports what the templates use: headings, bullet lists, paragraphs, images,
// links and bold. Everything else is passed through as escaped text.

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// imageSrc maps an image URL to the src to use (e.g. a data: URI).
function inline(text, imageSrc) {
  const images = [];
  // Pull images out first so their URLs are not touched by the link rule.
  let out = text.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, url) => {
    const [name, width] = alt.split('|');
    images.push(`<img src="${escapeHtml(imageSrc(url))}" alt="${escapeHtml(name)}"${/^\d+$/.test(width || '') ? ` width="${width}"` : ''}>`);
    return `\u0000${images.length - 1}\u0000`;
  });
  out = escapeHtml(out)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  return out.replace(/\u0000(\d+)\u0000/g, (m, i) => images[Number(i)]);
}

export function markdownToHtml(markdown, imageSrc = (url) => url) {
  const html = [];
  let list = false;
  const closeList = () => {
    if (list) html.push('</ul>');
    list = false;
  };
  markdown.split('\n').forEach((line) => {
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    const bullet = line.match(/^[-*]\s+(.*)$/);
    if (bullet) {
      if (!list) html.push('<ul>');
      list = true;
      html.push(`<li>${inline(bullet[1], imageSrc)}</li>`);
      return;
    }
    closeList();
    if (heading) html.push(`<h${heading[1].length}>${inline(heading[2], imageSrc)}</h${heading[1].length}>`);
    else if (line.trim()) html.push(`<p>${inline(line, imageSrc)}</p>`);
  });
  closeList();
  return html.join('\n');
}
