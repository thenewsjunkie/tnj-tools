

## Fix Text Visibility on /notepad in Dark Mode

### Problem

The TipTap editor text on `/notepad` is nearly invisible -- dark gray text on a near-black background. The `prose dark:prose-invert` Tailwind class should handle this but isn't applying the correct text color to the ProseMirror content.

### Fix

**`src/components/admin/show-prep/Notepad.tsx`**

Add an explicit text color class to the ProseMirror editor content area to ensure white text in dark mode:

- Add `[&_.ProseMirror]:text-foreground` to the TipTap editor wrapper's className. This forces the editor text to use the theme's foreground color (white in dark mode, dark in light mode), regardless of any `prose` specificity issues.

This is a one-line CSS class addition -- no logic changes needed. It fixes the issue on both `/notepad` and the admin Show Prep notepad.

