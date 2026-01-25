

## Plan: Add Background Images to Full Truth Builder

### Current State
The Full Truth builder supports:
- Solid colors for left/right backgrounds (`leftColor`, `rightColor`)
- Gradients via `leftGradient` and `rightGradient` optional fields
- No image background support

The `SplitBackground` component already prioritizes gradients over colors when rendering.

### Solution
Extend the theme system to support background images:
1. Add new optional fields to `ThemeConfig` for image URLs
2. Update `SplitBackground` to render images when provided
3. Create a Theme Settings dialog with image upload capability
4. Reuse the existing `upload-tapestry-image` edge function for background uploads

---

### Files to Modify

| File | Change |
|------|--------|
| `src/types/tapestry.ts` | Add `leftImageUrl` and `rightImageUrl` optional fields to `ThemeConfig` |
| `src/components/full-truth/shared/SplitBackground.tsx` | Support background images with proper CSS (cover, center, etc.) |
| `src/components/full-truth/builder/BuilderToolbar.tsx` | Add "Theme" button to open settings dialog |
| `src/pages/FullTruthBuilder.tsx` | Wire up theme dialog state and pass setThemeConfig |

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/full-truth/builder/ThemeSettingsDialog.tsx` | Dialog with image upload + color picker for left, right, and divider |

---

### Implementation Details

**1. Update ThemeConfig Type**

```typescript
export interface ThemeConfig {
  leftColor: string;
  rightColor: string;
  dividerColor: string;
  leftGradient?: string;
  rightGradient?: string;
  leftImageUrl?: string;    // NEW
  rightImageUrl?: string;   // NEW
  fontFamily?: string;
  [key: string]: string | undefined;
}
```

**2. Update SplitBackground Component**

The priority order for backgrounds will be:
1. Image (if `leftImageUrl`/`rightImageUrl` is set)
2. Gradient (if `leftGradient`/`rightGradient` is set)
3. Solid color (fallback)

```typescript
// For each pane:
style={{
  background: leftImageUrl 
    ? `url(${leftImageUrl}) center/cover no-repeat`
    : leftGradient || leftColor,
}}
```

**3. Create ThemeSettingsDialog**

A dialog with tabs or sections for each side:

```text
+------------------------------------------+
| Theme Settings                     [x]   |
+------------------------------------------+
|                                          |
| LEFT SIDE                                |
| +--------------------------------------+ |
| | [img preview]  [Upload Image]        | |
| |                [Remove Image]        | |
| | Or use color: [#1e3a5f] [picker]     | |
| +--------------------------------------+ |
|                                          |
| RIGHT SIDE                               |
| +--------------------------------------+ |
| | [img preview]  [Upload Image]        | |
| |                [Remove Image]        | |
| | Or use color: [#5f1e1e] [picker]     | |
| +--------------------------------------+ |
|                                          |
| DIVIDER                                  |
| | Color: [#ffffff] [picker]            | |
|                                          |
|                      [Apply Changes]     |
+------------------------------------------+
```

Features:
- Image upload using the existing `upload-tapestry-image` edge function
- Preview thumbnails for uploaded images
- "Remove" button to clear image and fall back to color
- Native color picker for solid colors
- Live preview - changes update the canvas immediately

**4. Update BuilderToolbar**

Add a Theme button:

```typescript
<Button variant="outline" size="sm" onClick={onOpenThemeSettings}>
  <Palette className="h-4 w-4 mr-2" />
  Theme
</Button>
```

**5. Wire Up in FullTruthBuilder**

- Add dialog open state
- Pass `themeConfig` and `setThemeConfig` to the dialog
- Theme changes apply immediately (live preview)
- Saved to database when "Save Draft" or "Publish" is clicked

---

### Database Compatibility

No database changes needed - the `theme_config` column is already JSONB and will accept the new `leftImageUrl`/`rightImageUrl` fields automatically.

---

### User Experience After Implementation

1. Click "Theme" button in the builder toolbar
2. Dialog opens with Left Side, Right Side, and Divider sections
3. For each side:
   - Upload an image from your device, OR
   - Pick a solid color
4. See the canvas update live as you make changes
5. Close the dialog - settings persist in the builder
6. Save the tapestry to persist to database

