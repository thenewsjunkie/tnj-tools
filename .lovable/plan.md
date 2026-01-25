

## Plan: Add Scale Control to Point Nodes

### Problem
When creating Point nodes in the Full Truth builder, there's no way to resize them. The data model already supports `scale` (it's stored in the database and applied via CSS), but the NodeInspector doesn't provide a UI control to change it.

### Solution
Add a scale slider to the NodeInspector for Point nodes, allowing users to shrink or enlarge individual points.

---

### File to Modify

| File | Change |
|------|--------|
| `src/components/full-truth/builder/NodeInspector.tsx` | Add a scale slider for point nodes (and optionally character nodes) |

---

### Implementation Details

**Add a Scale Slider Section**

Add this to the NodeInspector, appearing for both node types (after the "Side" selector):

```text
Current Inspector Layout:
┌─────────────────────────────────┐
│ Side: [Left ▼]                  │
│ Tag: [Claim ▼]         (points) │
│ Headline: [___________]         │
│ Detail: [_____________]         │
└─────────────────────────────────┘

After:
┌─────────────────────────────────┐
│ Side: [Left ▼]                  │
│ Scale: [────●────] 100%         │  ← NEW
│ Tag: [Claim ▼]         (points) │
│ Headline: [___________]         │
│ Detail: [_____________]         │
└─────────────────────────────────┘
```

**Scale Control Details:**

- Uses the existing Radix Slider component (`@/components/ui/slider`)
- Range: 0.5 to 1.5 (50% to 150% of default size)
- Step: 0.1 for smooth resizing
- Default: 1.0 (100%)
- Shows percentage label next to slider
- Changes apply immediately for live preview

**Code Changes:**

```typescript
// Add to NodeInspector.tsx imports
import { Slider } from "@/components/ui/slider";

// Add scale state tracking
const [scale, setScale] = useState(1);

// Update when node changes
useEffect(() => {
  if (node) {
    setScale((node.data as any).scale || 1);
  }
}, [node]);

// Add scale change handler
const handleScaleChange = (value: number[]) => {
  const newScale = value[0];
  setScale(newScale);
  onUpdate(node.id, { scale: newScale });
};

// Add to JSX (after Side selector, before node-specific fields)
<div className="space-y-2">
  <div className="flex items-center justify-between">
    <Label>Scale</Label>
    <span className="text-sm text-muted-foreground">
      {Math.round(scale * 100)}%
    </span>
  </div>
  <Slider
    value={[scale]}
    onValueChange={handleScaleChange}
    min={0.5}
    max={1.5}
    step={0.1}
  />
</div>
```

---

### User Experience After Implementation

1. Add a new Point to the canvas
2. Click on the Point to select it
3. In the inspector panel, use the "Scale" slider
4. Drag left to shrink the point (down to 50%)
5. Drag right to enlarge the point (up to 150%)
6. See the node resize in real-time on the canvas
7. Scale is saved with the tapestry

This same control will work for Character nodes too, giving users full control over sizing of all elements.

