

## Fix: Remove conflicting override for @tiptap/extension-highlight

npm does not allow an `overrides` entry for a package that is also a direct dependency. The fix is to remove `@tiptap/extension-highlight` from the `overrides` block (it's already pinned to `^2.27.2` in `dependencies`, so the override is redundant).

### Change

**`package.json`** — Update the `overrides` block:

```json
"overrides": {
  "@tiptap/core": "2.27.2"
}
```

Remove `"@tiptap/extension-highlight": "2.27.2"` from overrides. The direct dependency `"@tiptap/extension-highlight": "^2.27.2"` already controls its version.

One-line fix, no code changes.

