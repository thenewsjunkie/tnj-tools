

## Create Studio Screen Feature

### New Files

**1. `src/pages/Admin/StudioScreen.tsx`**
- New page component at `/admin/studio`
- Header with "Studio Screen" title and a left-aligned link back to `/admin` (using ArrowLeft or "← Admin" pattern matching the existing admin header style)
- Main content area as an empty control panel placeholder for now

### Modified Files

**2. `src/components/admin/AdminHeader.tsx`**
- Add `Monitor` (or `Tv`) icon import from lucide-react
- Insert a Link to `/admin/studio` with the TV icon, placed next to the GitHub icon on the top right

**3. `src/components/routing/routes.tsx`**
- Add lazy import for `StudioScreen`
- Add route `admin/studio` wrapped in `AdminRoute`

### Layout Details

**StudioScreen page:**
```text
+--------------------------------------------------+
| ← Admin              Studio Screen               |
+--------------------------------------------------+
|                                                   |
|              (Control Panel area)                 |
|                                                   |
+--------------------------------------------------+
```

**AdminHeader updated icon row:**
```text
  [GitHub icon] [TV/Studio icon] -- TNJ Tools -- [Settings icon]
```

