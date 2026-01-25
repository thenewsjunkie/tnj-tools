

## Plan: Make Full Truth Testable

### Current State
The foundation is built (database tables, types, hooks, custom nodes) but the feature isn't accessible yet because:
- No page components exist
- No routes are registered
- No navigation links to access it

---

### What I'll Create

**1. Gallery Page (`/full-truth`)**
- Lists all published tapestries
- Shows "Create New" button for admins
- Placeholder/empty state when no tapestries exist

**2. Builder Page (`/full-truth/new` and `/full-truth/edit/:id`)**
- Full React Flow canvas with the split background
- Node palette to add characters and points
- Inspector sidebar for editing selected nodes
- Save/Publish toolbar

**3. Viewer Page (`/full-truth/view/:slug`)**
- Full-screen presentation mode
- Interactive hover effects
- Click-to-expand details

---

### Files to Create

| File | Purpose |
|------|---------|
| `src/pages/FullTruth.tsx` | Gallery page listing tapestries |
| `src/pages/FullTruthBuilder.tsx` | Node editor with React Flow |
| `src/pages/FullTruthViewer.tsx` | Presentation viewer |
| `src/components/full-truth/builder/TapestryCanvas.tsx` | React Flow canvas wrapper |
| `src/components/full-truth/builder/NodePalette.tsx` | Drag-to-add node sidebar |
| `src/components/full-truth/builder/NodeInspector.tsx` | Edit selected node properties |
| `src/components/full-truth/builder/BuilderToolbar.tsx` | Save/Publish/Preview buttons |
| `src/components/full-truth/gallery/TapestryCard.tsx` | Gallery thumbnail card |

---

### Files to Modify

| File | Change |
|------|--------|
| `src/components/routing/routes.tsx` | Add 4 new routes for Full Truth |

---

### Access Options

Once built, you can test it by:

1. **Direct URL**: Navigate to `/full-truth` in your browser
2. **Admin Dashboard**: I can add a "Full Truth" CollapsibleModule to the Admin page
3. **TNJ Links**: You can manually add a link using the "+" button in TNJ Links

For the easiest testing experience, I recommend adding a link directly to the Admin dashboard since it's an admin-only feature. But I can also add it to TNJ Links if you prefer that for quick access during streams.

---

### Testing Flow

After implementation:

1. Go to `/full-truth` → See empty gallery with "Create New" button
2. Click "Create New" → Opens builder at `/full-truth/new`
3. Drag characters and points onto the canvas
4. Edit properties in the inspector
5. Save → Creates a draft tapestry
6. Publish → Makes it visible in the gallery
7. View → Opens the interactive presentation

