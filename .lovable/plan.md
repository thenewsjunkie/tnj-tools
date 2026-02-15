

## Fix Link Formatting for Markdown-Style Links

### Problem
The AI generates markdown links like `[NBC New York](https://example.com)`. The current regex only catches bare URLs, so the output becomes the ugly `[NBC New York]([Link])` instead of `NBC New York [Link]`.

### Solution
In `src/components/rundown/formatRundownContent.tsx`, update `formatInlineHTML` to handle markdown links **first** (before bare URLs):

1. Add a new regex to match `[text](url)` patterns and convert them to `text <a href="url">[Link]</a>`
2. Keep the existing bare URL regex as a fallback for URLs not wrapped in markdown syntax

### Updated function

```
export const formatInlineHTML = (text: string) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="...">$1</strong>')
    // Markdown links: [Label](url) -> Label [Link]
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '$1 <a href="$2" target="_blank" rel="noopener noreferrer" class="text-purple-400 underline hover:text-purple-300">[Link]</a>'
    )
    // Bare URLs (fallback)
    .replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-purple-400 underline hover:text-purple-300">[Link]</a>'
    );
};
```

Result: `Source: [NBC New York](https://...)` becomes `Source: NBC New York [Link]`

One file, one function change.
