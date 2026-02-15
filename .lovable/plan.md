

## Replace Print Summary Content with Executive Snapshot

The current `printRundownSummary` function searches for a "Big Takeaways" section in the rundown content, which isn't reliably present anymore. Instead, it will use the executive snapshot -- the first section of the rundown (everything before the second header), which is already extracted by the existing `splitRundownAtFirstSection` utility.

### What changes

**`src/components/admin/show-prep/PrintStrongman.tsx`**

1. Import `splitRundownAtFirstSection` from the formatRundownContent module.
2. Replace the "Big Takeaways" extraction logic (lines 10-17) with a call to `splitRundownAtFirstSection(content)` and use `firstSection` as the print body.
3. Convert the markdown in `firstSection` to HTML using the same bold-replacement approach already in the file, plus basic line break handling.
4. Update the subtitle label from "Rundown Summary Card" to "Executive Snapshot" for clarity.

### Result

The Print Summary button will now reliably output the executive snapshot (the introductory overview section) of the rundown, formatted cleanly for print. No other files change.

