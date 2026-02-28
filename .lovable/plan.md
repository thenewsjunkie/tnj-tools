

## Fix: Orientation Toggle Not Working on Output Page

### Problem
The orientation toggle in the admin saves the setting correctly (confirmed via network requests), but the `/output` page never actually switches layout direction. Line 196 of `Output.tsx` has a hardcoded `flex` class (which defaults to row direction) -- the `flex-col` class is never applied when vertical mode is selected.

### Fix

**`src/pages/Output.tsx` (line 196)**

Change the two-column container from:
```
<div className="flex-1 flex min-h-0">
```
to:
```
<div className={`flex-1 flex min-h-0 ${(config?.orientation ?? "horizontal") === "vertical" ? "flex-col" : "flex-row"}`}>
```

This is a one-line fix. The divider styling (line 206) is already correct -- it switches between `h-px` and `w-px` based on orientation. The container just needs to match.

