

## Plan: "The Full Truth" - Interactive Split-Screen Explainer Builder

### Overview
Build a full-featured interactive explainer tool with a node-based editor for creating "tapestries" - split-screen visualizations that place people and talking points on a left/right divide with connecting lines and hover animations.

---

### Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                        Routes                                   │
├─────────────────────────────────────────────────────────────────┤
│  /full-truth              → Gallery (public, lists published)  │
│  /full-truth/new          → Builder (admin only, create new)   │
│  /full-truth/edit/:id     → Builder (admin only, edit draft)   │
│  /full-truth/view/:slug   → Viewer (public, presentation)      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Database (Supabase)                          │
├─────────────────────────────────────────────────────────────────┤
│  tapestries       → Main tapestry metadata                      │
│  tapestry_nodes   → Character and Point nodes                   │
│  tapestry_edges   → Connections between nodes                   │
│  tapestry_scenes  → Optional scene/step definitions             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Components                                   │
├─────────────────────────────────────────────────────────────────┤
│  TapestryBuilder  → React Flow canvas + sidebar inspector       │
│  TapestryViewer   → Presentation mode with hover effects        │
│  CharacterNode    → Popsicle stick character (custom node)      │
│  PointNode        → Bullet/callout box (custom node)            │
│  NodeInspector    → Sidebar form for editing selected node      │
└─────────────────────────────────────────────────────────────────┘
```

---

### Database Schema (Supabase Migration)

**Table: `tapestries`**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| title | text | Tapestry title |
| slug | text | URL-friendly slug (unique) |
| status | enum | 'draft' or 'published' |
| thumbnail_url | text | Auto-generated preview image |
| theme_config | jsonb | Colors, fonts, background settings |
| created_by | uuid | Reference to auth.users |
| created_at | timestamptz | Created timestamp |
| updated_at | timestamptz | Last modified |

**Table: `tapestry_nodes`**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| tapestry_id | uuid | FK to tapestries |
| type | enum | 'character' or 'point' |
| side | enum | 'left', 'right', or 'neutral' |
| position_x | float | X position on canvas |
| position_y | float | Y position on canvas |
| scale | float | Node scale (default 1.0) |
| rotation | float | Node rotation in degrees |
| data | jsonb | Type-specific data (see below) |
| scene_visibility | jsonb | Which scenes this node appears in |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Node Data JSON Structures:**
```json
// Character node data
{
  "name": "John Smith",
  "title": "CEO, Example Corp",
  "imageUrl": "https://...",
  "notes": "Additional context..."
}

// Point node data
{
  "headline": "Key Claim",
  "detail": "Detailed explanation...",
  "tag": "claim", // claim | evidence | context
  "sources": [
    { "label": "Source 1", "url": "https://..." }
  ]
}
```

**Table: `tapestry_edges`**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| tapestry_id | uuid | FK to tapestries |
| source_node_id | uuid | FK to tapestry_nodes |
| target_node_id | uuid | FK to tapestry_nodes |
| data | jsonb | Edge styling (color, style, etc.) |

**Table: `tapestry_scenes`** (for Step Mode)
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| tapestry_id | uuid | FK to tapestries |
| order_index | int | Scene order (0, 1, 2...) |
| name | text | Scene name/label |
| config | jsonb | Node positions, zoom, pan for this scene |

---

### Storage Bucket

**Bucket: `tapestry_media`** (public)
- Character headshot images
- Theme backgrounds
- Generated thumbnails

---

### New Dependencies

```json
{
  "@xyflow/react": "^12.x",  // React Flow v12 (successor to reactflow)
  "html-to-image": "^1.11.13"  // Already installed - for thumbnail generation
}
```

---

### File Structure

```
src/
├── pages/
│   ├── FullTruth.tsx                    # Gallery/list page
│   ├── FullTruthBuilder.tsx             # Builder page (new + edit)
│   └── FullTruthViewer.tsx              # Presentation viewer
│
├── components/full-truth/
│   ├── builder/
│   │   ├── TapestryCanvas.tsx           # React Flow canvas wrapper
│   │   ├── CanvasControls.tsx           # Zoom, pan, grid, undo/redo
│   │   ├── NodeInspector.tsx            # Sidebar inspector panel
│   │   ├── NodePalette.tsx              # Drag-to-add node palette
│   │   └── SceneManager.tsx             # Scene/step management
│   │
│   ├── nodes/
│   │   ├── CharacterNode.tsx            # Popsicle stick character
│   │   ├── PointNode.tsx                # Bullet/callout node
│   │   └── nodeStyles.css               # Node-specific animations
│   │
│   ├── viewer/
│   │   ├── TapestryPresentation.tsx     # Full-screen viewer
│   │   ├── DetailDrawer.tsx             # Click-to-expand detail modal
│   │   ├── CharacterCard.tsx            # Mini profile popup
│   │   └── SceneNavigator.tsx           # Next/Back scene controls
│   │
│   ├── gallery/
│   │   ├── TapestryCard.tsx             # Gallery thumbnail card
│   │   └── TapestryGrid.tsx             # Gallery grid layout
│   │
│   └── shared/
│       ├── SplitBackground.tsx          # Left/right background panes
│       └── useTapestryStore.ts          # Zustand or context state
│
├── hooks/
│   ├── useTapestry.ts                   # CRUD operations
│   └── useTapestryNodes.ts              # Node/edge management
│
└── types/
    └── tapestry.ts                      # TypeScript interfaces
```

---

### Page Implementations

**1. `/full-truth` - Gallery Page**

```tsx
// Public page showing published tapestries
- Grid of TapestryCard components (thumbnail, title, date)
- "Create New" button (visible to authenticated admins only)
- Click card → navigate to /full-truth/view/[slug]
```

**2. `/full-truth/new` and `/full-truth/edit/:id` - Builder Page**

```tsx
// Admin-only builder interface
<div className="h-screen flex">
  {/* Node Palette (left sidebar) */}
  <NodePalette />
  
  {/* Main Canvas */}
  <div className="flex-1 relative">
    <SplitBackground /> {/* Left/right panes with center divider */}
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={{ character: CharacterNode, point: PointNode }}
    />
    <CanvasControls /> {/* Zoom, grid, align, undo/redo */}
  </div>
  
  {/* Inspector (right sidebar) */}
  <NodeInspector selectedNode={selectedNode} />
</div>

// Top toolbar: Save Draft | Publish | Duplicate | Preview
```

**3. `/full-truth/view/:slug` - Presentation Viewer**

```tsx
// Full-screen interactive presentation
<div className="h-screen relative overflow-hidden">
  <SplitBackground theme={tapestry.theme_config} />
  
  {/* Render all nodes with hover effects */}
  {nodes.map(node => 
    node.type === 'character' 
      ? <CharacterNode key={node.id} data={node} interactive />
      : <PointNode key={node.id} data={node} interactive />
  )}
  
  {/* Render edges/connections */}
  <svg className="absolute inset-0 pointer-events-none">
    {edges.map(edge => <ConnectionLine key={edge.id} {...edge} />)}
  </svg>
  
  {/* Scene navigation (if scenes exist) */}
  {hasScenes && <SceneNavigator current={scene} onNavigate={...} />}
  
  {/* Detail drawer for clicked items */}
  <DetailDrawer item={selectedItem} />
</div>
```

---

### Custom Node Components

**CharacterNode (Popsicle Stick Style)**

```tsx
// Circular headshot on a stick
<div className="character-node group cursor-pointer">
  {/* Head - circular image */}
  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg
                  group-hover:animate-bob group-hover:shadow-xl transition-all">
    <img src={data.imageUrl} alt={data.name} className="w-full h-full object-cover" />
  </div>
  
  {/* Stick */}
  <div className="w-3 h-16 bg-amber-600 mx-auto rounded-b-lg shadow-md" />
  
  {/* Name label */}
  <div className="text-center mt-2 font-bold text-lg text-white drop-shadow-lg">
    {data.name}
  </div>
  <div className="text-center text-sm text-white/80">
    {data.title}
  </div>
</div>
```

**PointNode (Callout Box)**

```tsx
// Tag-colored callout box
<div className={cn(
  "point-node p-4 rounded-lg shadow-lg cursor-pointer transition-all",
  "hover:scale-105 hover:shadow-xl",
  tagColors[data.tag] // claim=red, evidence=blue, context=gray
)}>
  {/* Tag badge */}
  <Badge>{data.tag}</Badge>
  
  {/* Headline */}
  <h3 className="font-bold text-lg">{data.headline}</h3>
  
  {/* Preview of detail (truncated) */}
  {data.detail && (
    <p className="text-sm opacity-80 line-clamp-2">{data.detail}</p>
  )}
  
  {/* Source indicator */}
  {data.sources?.length > 0 && (
    <div className="text-xs mt-2">{data.sources.length} source(s)</div>
  )}
</div>
```

---

### Hover & Click Interactions (Viewer)

**Hover Effects:**
1. **Character hover**: Subtle bob/tilt animation, enhanced shadow, connected bullet nodes highlight (others dim)
2. **Point hover**: Scale up slightly, connector line brightens, unrelated items dim to 50% opacity

**Click Behavior:**
1. **Click character**: Opens mini profile card (name, title, notes)
2. **Click point**: Opens detail drawer/modal with full text + clickable source links

**Implementation:**
```tsx
// Track hover state
const [hoveredNodeId, setHoveredNodeId] = useState(null);
const [selectedNodeId, setSelectedNodeId] = useState(null);

// Get connected nodes for highlight
const connectedNodes = edges
  .filter(e => e.source === hoveredNodeId || e.target === hoveredNodeId)
  .flatMap(e => [e.source, e.target]);

// Apply dim class to unrelated nodes
const getNodeClass = (nodeId) => 
  hoveredNodeId && !connectedNodes.includes(nodeId) && nodeId !== hoveredNodeId
    ? 'opacity-30 transition-opacity'
    : 'opacity-100 transition-opacity';
```

---

### Scene/Step Mode

When a tapestry has multiple scenes:
- Show Next/Back navigation buttons
- Each scene defines which nodes are visible + their positions
- Transitions animate nodes in/out with fade/slide effects
- Scene indicator shows progress (Scene 1 of 4)

```tsx
<SceneNavigator
  scenes={scenes}
  currentIndex={currentScene}
  onPrevious={() => setCurrentScene(i => Math.max(0, i - 1))}
  onNext={() => setCurrentScene(i => Math.min(scenes.length - 1, i + 1))}
/>
```

---

### Thumbnail Generation

Using the existing `html-to-image` library:
```tsx
import { toPng } from 'html-to-image';

const generateThumbnail = async (canvasRef) => {
  const dataUrl = await toPng(canvasRef.current, {
    width: 1200,
    height: 675, // 16:9 ratio
    quality: 0.8
  });
  
  // Upload to Supabase storage
  const { data } = await supabase.storage
    .from('tapestry_media')
    .upload(`thumbnails/${tapestryId}.png`, dataUrlToBlob(dataUrl));
  
  return data.path;
};
```

---

### RLS Policies

```sql
-- Tapestries: Public can view published, authenticated can create/edit own
CREATE POLICY "Anyone can view published tapestries"
  ON tapestries FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authenticated users can manage their tapestries"
  ON tapestries FOR ALL
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Nodes/Edges/Scenes: Inherit access from parent tapestry
-- (Use security definer function to check tapestry ownership)
```

---

### Routes to Add

```tsx
// In src/components/routing/routes.tsx
{
  path: "full-truth",
  element: <FullTruth />,
},
{
  path: "full-truth/new",
  element: <AdminRoute><FullTruthBuilder /></AdminRoute>,
},
{
  path: "full-truth/edit/:id",
  element: <AdminRoute><FullTruthBuilder /></AdminRoute>,
},
{
  path: "full-truth/view/:slug",
  element: <FullTruthViewer />,
},
```

---

### Implementation Order

| Phase | Tasks |
|-------|-------|
| **1. Database** | Create migration for all tables, storage bucket, RLS policies |
| **2. Types & Hooks** | TypeScript interfaces, CRUD hooks with React Query |
| **3. Gallery** | Gallery page, TapestryCard component, routing |
| **4. Builder Core** | React Flow setup, custom nodes, basic canvas |
| **5. Builder Inspector** | Sidebar forms for character/point editing |
| **6. Builder Features** | Grid, zoom, pan, undo/redo, save/publish |
| **7. Viewer Core** | Presentation layout, render nodes/edges |
| **8. Viewer Interactions** | Hover effects, click modals, connection highlighting |
| **9. Scenes** | Scene manager in builder, step navigation in viewer |
| **10. Polish** | Thumbnail generation, animations, responsive tweaks |

---

### Technical Notes

- **React Flow v12**: Uses `@xyflow/react` package name (not `reactflow`)
- **State Management**: Use React Query for server state, local state for canvas interactions
- **Thumbnail timing**: Generate on "Publish" action, not on every save
- **Performance**: Use `react-flow`'s built-in virtualization for many nodes
- **Broadcast-safe**: Large fonts (min 24px), high contrast, no tiny text

