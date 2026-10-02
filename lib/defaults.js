export const DEFAULT_TEMPLATE = `# {{title}}

![cover|300]({{cover}})

- **Author:** {{authors|wikilink}}
- **Published:** {{publicationDate}}
- **Rating:** {{rating}}
- **Pages:** {{pages}}
- **Goodreads:** [{{title}}]({{url}})
`;

export async function loadTemplate() {
  const { template } = await chrome.storage.sync.get('template');
  return template || DEFAULT_TEMPLATE;
}
