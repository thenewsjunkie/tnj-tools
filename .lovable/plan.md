
## Plan: Add "Potential Videos" Section

### Overview
Add a new section called "Potential Videos" below the "Last Minute Message" area where you can add ideas for videos to create after the show. This section will be saved per-date and included on the printed show prep document.

---

### 1. Database Migration

**Add new column to `show_prep_notes` table:**

```sql
ALTER TABLE show_prep_notes 
ADD COLUMN potential_videos TEXT;
```

This will store the video ideas as a text field (newline-separated for multiple ideas).

---

### 2. Update ShowPrep Component

**File: `src/components/admin/ShowPrep.tsx`**

Changes:
- Add new state variable: `potentialVideos`
- Update `loadData` function to fetch the new field
- Update the debounced save effect to include the new field
- Add a new UI section after the Last Minute Message (visible every day) with:
  - A textarea for entering video ideas (one per line)
  - A clear button
  - Video icon for visual distinction

**UI placement:** Below the Friday "Last Minute Message" section (always visible, not day-specific)

---

### 3. Update Print Document

**File: `src/components/admin/show-prep/PrintShowPrep.tsx`**

Changes:
- Add `potentialVideos` to the `PrintData` interface
- Add a new styled section at the bottom of the print layout with:
  - Purple/violet accent color (to distinguish from other sections)
  - Video camera icon (🎬)
  - Each video idea as a bullet point or line item

**Styling:**
```css
.potential-videos {
  background: #f3e8ff; /* light purple */
  border: 1px solid #c4b5fd;
  border-radius: 4px;
  padding: 8px 12px;
  margin-top: 12px;
}
```

---

### 4. Update handlePrint Function

**File: `src/components/admin/ShowPrep.tsx`**

Pass the `potentialVideos` state to the `generatePrintDocument` function call.

---

### Summary of Changes

| Location | Change |
|----------|--------|
| Database | Add `potential_videos` TEXT column |
| `ShowPrep.tsx` | Add state, load/save logic, and textarea UI |
| `PrintShowPrep.tsx` | Add interface field and styled print section |

### Example Print Output

The new section will appear at the bottom of the printed page:

```
🎬 Potential Videos
• Video idea 1
• Video idea 2
• Video idea 3
```
