

## Move Media Links Below Executive Snapshot

### What changes
Currently the Media section appears above all rundown content. This change moves it to appear right after the Executive Snapshot section (the first section in the rundown), so the flow becomes:

1. Header, hero image
2. Executive Snapshot section
3. **Media links**
4. Remaining rundown sections

### How

**File: `src/components/rundown/formatRundownContent.tsx`**

Update the function to return a split result -- two arrays: the "first section" elements (Executive Snapshot) and the "rest" elements. We'll export a new helper `splitRundownAtFirstSection` that:
- Finds the index of the second section header in the rendered elements
- Returns `{ firstSection: elements[0..splitIndex], rest: elements[splitIndex..end] }`

**File: `src/pages/RundownPage.tsx`**

Instead of rendering all content in one block, call the split helper and render:

```
{firstSection}
<MediaLinksSection ... />
{rest}
```

### Details

The split logic will scan the raw content string for the second `##` or `**bold header**` line, then split the text there. This way `formatRundownContent` is called twice -- once for the Executive Snapshot portion, once for the remainder -- keeping the existing rendering logic untouched.
