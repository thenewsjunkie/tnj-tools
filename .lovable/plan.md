

## Consolidate Output Control Layout

Merge four separate rows into two combined rows to save vertical space.

### Changes (single file: `src/components/studio/OutputControl.tsx`)

**Row 1: Layout + Rotation (lines 200-238)**
Replace the two separate sections (Layout buttons and Rotation buttons) with a single `flex` row:
```
Layout [Horizontal] [Vertical]  |  Rotation [0°] [90°] [180°] [270°]
```
Uses `flex items-center gap-3` with a visual separator or just spacing between the two groups.

**Row 2: Chat Source + Chat Zoom (lines 267-301)**
Replace the two separate rows (Chat Zoom slider and Chat Source buttons) with a single `flex` row:
```
Chat Source [Restream] [Discord]  |  Chat Zoom [====slider====] 150%
```
Remove the Monitor icons to save horizontal space; combine into one `flex items-center gap-3` row.

### No other files affected
Only `src/components/studio/OutputControl.tsx` is modified -- purely a layout/template change with no logic changes.
