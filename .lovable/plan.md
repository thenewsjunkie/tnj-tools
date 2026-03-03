

## Fix: TipTap Extension-Highlight Version Conflict

### Root Cause
`@tiptap/extension-highlight@3.20.0` requires `@tiptap/core@^3.20.0`, but all other `@tiptap/*` packages in the project are at v2.27.2. npm cannot resolve this peer dependency conflict.

### Fix

**`package.json`**
1. Change `@tiptap/extension-highlight` version from `^3.20.0` to `^2.27.2`
2. Add an `overrides` block to pin TipTap core versions and prevent future drift:

```json
"overrides": {
  "@tiptap/core": "2.27.2",
  "@tiptap/extension-highlight": "2.27.2"
}
```

This is a one-file, two-line fix. No code changes needed — only the dependency version alignment.

