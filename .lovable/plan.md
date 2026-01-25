
## Plan: Replace Resources with Topic Bullets

### What's Changing
Replacing the "Add Resources" feature in the Topics Module with the ability to attach bullet points directly to topics. These bullets will appear below the hot take and will be included in the daily outline printout.

### Current State
- Topics have a `Plus` button that opens a separate `/admin/topic-resources` page
- The `Topic` type already has a `bullets: Bullet[]` array (currently empty for most topics)
- `BulletEditor` component exists and handles all bullet editing with keyboard shortcuts

### Files to Modify

| File | Change |
|------|--------|
| `src/components/admin/show-prep/TopicCard.tsx` | Replace Resources button with Bullet popover |
| `src/components/admin/show-prep/PrintShowPrep.tsx` | Add bullets rendering below the hot take |

### Files to Delete (optional, can be done later)

| File | Reason |
|------|--------|
| `src/pages/TopicResources.tsx` | No longer needed |
| `src/components/resources/AddResourceForm.tsx` | No longer needed |
| `src/components/resources/SortableResourceCard.tsx` | No longer needed |
| `src/components/resources/ResourceCard.tsx` | No longer needed |
| `src/components/resources/ResourceDropzone.tsx` | No longer needed |

---

### Implementation Details

**1. Update TopicCard.tsx**

Replace the Resources button with a Bullet popover:

```text
Before:
┌─────────────────────────────────────────────┐
│ ⋮ Topic Title        💪 🔥 [+] ✏️ ⋮ 🗑️    │
│   🔥 Hot take text...                       │
└─────────────────────────────────────────────┘

After:
┌─────────────────────────────────────────────┐
│ ⋮ Topic Title        💪 🔥 • ✏️ ⋮ 🗑️     │
│   🔥 Hot take text...                       │
│   • Bullet point 1                          │
│   • Bullet point 2                          │
└─────────────────────────────────────────────┘
```

Changes:
- Replace `Plus` icon with `List` (bullet list) icon from lucide-react
- Add a Popover (similar to hot take) that contains the BulletEditor component
- Display bullets inline below the hot take when viewing (not editing)
- Highlight the bullet icon when bullets exist (similar to how flame icon works for takes)

**2. Bullet Popover Implementation**

```typescript
// Add state
const [bulletsOpen, setBulletsOpen] = useState(false);

// Add handler
const handleBulletsChange = (bullets: Bullet[]) => {
  onChange({ ...topic, bullets });
};

// Check for existing bullets
const hasBullets = topic.bullets?.length > 0 && 
                   topic.bullets.some(b => b.text.trim());

// Popover with BulletEditor
<Popover open={bulletsOpen} onOpenChange={setBulletsOpen}>
  <PopoverTrigger asChild>
    <Button
      size="sm"
      variant="ghost"
      className={cn(
        "h-6 px-1.5",
        hasBullets 
          ? "text-blue-500 hover:text-blue-600" 
          : "text-muted-foreground hover:text-blue-500"
      )}
      title={hasBullets ? "Edit bullets" : "Add bullets"}
    >
      <List className={cn("h-3.5 w-3.5", hasBullets && "fill-current")} />
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-80" align="end">
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <List className="h-4 w-4 text-blue-500" />
        Talking Points
      </div>
      <BulletEditor 
        bullets={topic.bullets || []}
        onChange={handleBulletsChange}
      />
    </div>
  </PopoverContent>
</Popover>
```

**3. Display Bullets Inline**

Below the hot take section:

```typescript
{/* Display bullets when not editing */}
{!isEditing && hasBullets && (
  <div className="ml-5 pl-2 border-l-2 border-blue-300 space-y-0.5">
    {topic.bullets.filter(b => b.text.trim()).map((bullet) => (
      <div 
        key={bullet.id} 
        className="flex items-start gap-1.5 text-xs text-muted-foreground"
        style={{ paddingLeft: `${bullet.indent * 12}px` }}
      >
        <span className="text-blue-500">•</span>
        <span className={cn(bullet.checked && "line-through opacity-50")}>
          {bullet.text}
        </span>
      </div>
    ))}
  </div>
)}
```

**4. Update PrintShowPrep.tsx**

Add CSS for bullet points and render them in the topic section:

```typescript
// Add style for topic bullets
.topic-bullets {
  margin-top: 4px;
  padding-left: 16px;
  font-size: 11px;
}
.topic-bullets li {
  margin: 2px 0;
  color: #555;
}

// Update topic rendering
${localTopics.map((topic) => {
  const bullets = topic.bullets?.filter(b => b.text.trim()) || [];
  return `
    <div class="topic">
      <span class="topic-title">${topic.type === "link" ? "🔗 " : ""}${topic.title || "Untitled"}</span>
      ${topic.take ? `<div class="topic-take">🔥 ${topic.take}</div>` : ""}
      ${bullets.length > 0 ? `
        <ul class="topic-bullets">
          ${bullets.map(b => `<li style="margin-left: ${b.indent * 12}px">${b.text}</li>`).join('')}
        </ul>
      ` : ''}
    </div>
  `;
}).join("")}
```

---

### User Experience After Implementation

1. Click the bullet icon (•) next to any topic
2. A popover opens with the bullet editor
3. Type talking points with Enter to add new bullets
4. Use Tab/Shift+Tab to indent/outdent
5. Use checkboxes to mark items as covered
6. Close the popover - bullets appear inline below the hot take
7. Print the daily outline - bullets show under each topic

---

### Route Cleanup (Optional)

The TopicResources page and route can be removed later if you want to fully clean up the resources feature. This plan focuses on the core change first.
