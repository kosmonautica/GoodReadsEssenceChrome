export const DEFAULT_TEMPLATE = `# {{title}}

![cover]({{cover}})

- **Author:** {{authors}}
- **Published:** {{publicationDate}}
- **Rating:** {{rating}}
- **Pages:** {{pages}}
- **Goodreads:** {{url}}
`;

export async function loadTemplate() {
  const { template } = await chrome.storage.sync.get('template');
  return template || DEFAULT_TEMPLATE;
}
