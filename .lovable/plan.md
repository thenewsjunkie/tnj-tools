

## Plan: Add "Move to Next Day" Button to Topics

### Overview
Add an icon button to the bottom-right of each topic card that, when clicked, transfers that topic to the next day's show prep notes.

### Visual Design

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ ⋮⋮ Topic Title                    [🔥] [•] [✏️] [🗑️]                    │
│   └── Hot take / bullets displayed here...                             │
│                                                          [→] Move Next │
└─────────────────────────────────────────────────────────────────────────┘
```

The icon will be a right-arrow (like `ArrowRight` or `SkipForward`) positioned in the bottom-right corner of the card, appearing subtly but accessible.

---

### Files to Modify

| File | Change |
|------|--------|
| `src/components/admin/show-prep/TopicCard.tsx` | Add the move button in bottom-right position |
| `src/components/admin/show-prep/TopicList.tsx` | Pass through the `onMoveToNextDay` callback |
| `src/components/admin/show-prep/ShowPrepNotes.tsx` | Implement the move logic (remove from current, add to next day) |

---

### Technical Implementation

#### 1. TopicCard - Add Move Button

Add an `onMoveToNextDay` prop and render a button in the bottom-right of the card:

```typescript
interface TopicCardProps {
  topic: Topic;
  date: string;
  onChange: (topic: Topic) => void;
  onDelete: () => void;
  onMoveToNextDay: () => void;  // New prop
}

// In the component, add at the end of the card:
<div className="flex justify-end mt-1">
  <Button
    size="sm"
    variant="ghost"
    className="h-5 text-xs text-muted-foreground hover:text-primary gap-1"
    onClick={onMoveToNextDay}
    title="Move to next day"
  >
    <ArrowRight className="h-3 w-3" />
  </Button>
</div>
```

#### 2. TopicList - Pass Through Callback

Update TopicList to receive and forward the callback:

```typescript
interface TopicListProps {
  topics: Topic[];
  date: string;
  onChange: (topics: Topic[]) => void;
  onMoveTopicToNextDay: (topic: Topic) => void;  // New prop
}

// Pass to each TopicCard:
<TopicCard
  ...
  onMoveToNextDay={() => onMoveTopicToNextDay(topic)}
/>
```

#### 3. ShowPrepNotes - Move Logic

The main logic:

```typescript
const handleMoveTopicToNextDay = async (topicToMove: Topic) => {
  // 1. Calculate next day's date
  const nextDate = format(addDays(selectedDate, 1), "yyyy-MM-dd");
  
  // 2. Remove from current day's topics
  const updatedLocalTopics = localTopics.filter(t => t.id !== topicToMove.id);
  setLocalTopics(updatedLocalTopics);
  
  // 3. Fetch or create next day's data
  const { data: nextDayData } = await supabase
    .from("show_prep_notes")
    .select("*")
    .eq("date", nextDate)
    .maybeSingle();
  
  // 4. Parse existing topics for next day
  let nextDayTopics: Topic[] = [];
  if (nextDayData?.topics) {
    // Handle same parsing logic as in useEffect
    const rawData = nextDayData.topics;
    if (Array.isArray(rawData.topics)) {
      nextDayTopics = rawData.topics;
    } else if (Array.isArray(rawData)) {
      nextDayTopics = rawData;
    }
  }
  
  // 5. Add topic to next day (at end, with new display_order)
  const movedTopic = {
    ...topicToMove,
    display_order: nextDayTopics.length,
  };
  nextDayTopics.push(movedTopic);
  
  // 6. Save to next day
  await supabase
    .from("show_prep_notes")
    .upsert({
      date: nextDate,
      topics: { topics: nextDayTopics }
    }, { onConflict: "date" });
  
  // 7. Invalidate query cache for next day
  queryClient.invalidateQueries({ 
    queryKey: ["show-prep-notes", nextDate] 
  });
  
  // 8. Show success toast
  toast.success("Moved to " + format(addDays(selectedDate, 1), "MMM d"));
};
```

---

### User Experience

| Action | Result |
|--------|--------|
| Click arrow icon | Topic immediately disappears from current day |
| | Toast notification confirms: "Moved to Jan 29" |
| Navigate to next day | Topic appears at the bottom of that day's list |

---

### Edge Cases Handled

- **Next day has no data yet**: Creates new show_prep_notes record
- **Next day already has topics**: Appends to the end of existing list
- **Topic has all metadata**: Preserves bullets, take, strongman, etc.

