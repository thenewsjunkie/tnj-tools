

## Two Changes

### 1. Move "Open Full Page" to the top of the dropdown menu

In `src/components/admin/show-prep/StrongmanButton.tsx`, reorder the menu items so "Open Full Page" is the first item when a rundown exists (lines 197-217).

### 2. Convert raw URLs to clickable `[Link]` text

In `src/components/rundown/formatRundownContent.tsx`, the `formatInlineHTML` function (line 7-8) currently renders the full URL as the link text:

```
<a href="$1">$1</a>
```

Change this to display `[Link]` instead:

```
<a href="$1">[Link]</a>
```

This applies to both the full-page rundown view and the View Rundown dialog (which renders `whitespace-pre-wrap` content -- we should also apply the same link formatting there by using `dangerouslySetInnerHTML` with `formatInlineHTML` instead of raw text).

### Files to modify

**`src/components/admin/show-prep/StrongmanButton.tsx`**
- Swap the "Open Full Page" menu item to be the first entry (before "View Rundown")
- In the View Rundown dialog, render the content using `dangerouslySetInnerHTML` with `formatInlineHTML` so URLs become `[Link]` there too (currently it just renders raw text)

**`src/components/rundown/formatRundownContent.tsx`**
- Change the URL regex replacement in `formatInlineHTML` from displaying the full URL to displaying `[Link]`
- Export `formatInlineHTML` so the StrongmanButton dialog can use it

