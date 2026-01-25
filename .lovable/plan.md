

## Plan: Add Photo Upload for Character Nodes

### Current State
When editing a "Person" node in the Full Truth builder, users can only paste an image URL manually. This isn't user-friendly for uploading photos from their computer.

### Solution
Replace the URL text input with a file upload component that:
- Allows users to upload images directly from their device
- Shows a preview of the uploaded/current image
- Still allows pasting a URL as a fallback
- Uploads to the existing `tapestry_media` storage bucket

---

### Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/upload-tapestry-image/index.ts` | Edge function to upload images to the `tapestry_media` bucket |

### Files to Modify

| File | Change |
|------|--------|
| `src/components/full-truth/builder/NodeInspector.tsx` | Replace URL input with upload component + URL fallback |

---

### Implementation Details

**1. Create Edge Function (`upload-tapestry-image`)**

A simple edge function that:
- Accepts a file via FormData
- Uploads to the `tapestry_media` bucket
- Returns the public URL

```typescript
// supabase/functions/upload-tapestry-image/index.ts
serve(async (req) => {
  const formData = await req.formData();
  const file = formData.get('file');
  
  // Upload to tapestry_media bucket
  const { data, error } = await supabase.storage
    .from('tapestry_media')
    .upload(fileName, file);
    
  return new Response(JSON.stringify({ url: publicUrl }));
});
```

**2. Update NodeInspector Component**

Replace the simple URL input with a combined upload/URL interface:

```text
Current (lines 93-100):
┌────────────────────────────┐
│ Image URL                  │
│ [https://...           ]   │
└────────────────────────────┘

After:
┌────────────────────────────┐
│ Photo                      │
│ ┌──────┐ [Choose File]     │
│ │      │ or paste URL:     │
│ │ img  │ [https://...   ]  │
│ └──────┘                   │
└────────────────────────────┘
```

The updated section will:
- Show a circular preview of the current image (matching the node's appearance)
- Provide a file input for uploading
- Keep a URL input as fallback for external images
- Handle upload progress and errors with toast notifications

---

### Technical Notes

- Uses the existing `tapestry_media` storage bucket (already public)
- Follows the same pattern as `upload-show-note-image` edge function
- Images are uploaded with unique UUIDs to prevent conflicts
- The upload component will be inline in NodeInspector (not a separate component) since it's specific to character nodes

---

### User Experience After Implementation

1. Click on a Person node in the builder
2. See the inspector panel on the right
3. Under "Photo" section:
   - Click "Choose File" to upload from device
   - Or paste an external URL in the text field
4. See a preview of the image immediately
5. The character node updates with the new photo

