

## Add "Datasheet" Feature to Topic Cards

A new "Datasheet" button will be added to the left of the Strongman button on each topic card. It follows the same pattern as Strongman -- a popover with AI generation, viewing, printing, and regeneration -- but with a multi-select step where you choose which data sections to include.

### Data Sections (Checkboxes)

- **Basic Details** -- Key facts, people involved, background context
- **Timeline** -- Chronological sequence of events
- **Polling Data** -- Public opinion, survey results on the topic and related issues
- **Key Players** -- Who's involved, their positions and motivations
- **Legal/Regulatory** -- Relevant laws, rulings, or pending legislation
- **Financial Impact** -- Economic data, costs, budget implications

### How It Works

1. Click the datasheet icon (the `BarChart3` icon in green) to open a popover
2. If no datasheet exists yet, you see checkboxes for each data section plus an optional custom prompt textarea
3. Select the sections you want, click "Generate Datasheet"
4. The AI assembles a structured, printable one-page datasheet with only the requested sections
5. Once generated, you can view, print, or regenerate (same UX as Strongman)

### Files to Create

**`src/components/admin/show-prep/DatasheetButton.tsx`**
- New component mirroring `StrongmanButton.tsx` structure
- Adds a checkbox selection step before generation
- Uses `BarChart3` icon from lucide-react (green accent color to distinguish from Strongman's blue)
- Stores result in `topic.datasheet` with `content`, `generatedAt`, `prompt`, and `selectedSections`

**`src/components/admin/show-prep/PrintDatasheet.tsx`**
- Print function mirroring `PrintStrongman.tsx`
- Same dense one-page layout but with green accent color instead of blue
- Header reads "Datasheet" with a chart icon

### Files to Modify

**`src/components/admin/show-prep/types.ts`**
- Add `Datasheet` interface with fields: `content`, `generatedAt`, `prompt`, `selectedSections` (string array)
- Add `datasheet?: Datasheet` to the `Topic` interface

**`src/components/admin/show-prep/TopicCard.tsx`**
- Import and render `DatasheetButton` to the left of `StrongmanButton`
- Wire up `onChange` to update `topic.datasheet`

**`supabase/functions/ask-ai/index.ts`**
- Add a `datasheetMode` branch with a new system prompt that instructs the AI to produce a structured datasheet limited to ~500 words
- Accept a `sections` parameter to control which sections appear
- The prompt will tell the AI to only include the requested section headers and skip the rest

### Technical Details

The AI prompt for datasheets will look like:

```text
You are a research analyst for a radio show. Create a concise data briefing sheet.
KEEP TOTAL RESPONSE UNDER 500 WORDS to fit on one printed page.

Only include the following sections: [selected sections]

Format with **SECTION NAME** headers and bullet points with specific data, 
dates, numbers, and sources where possible.
```

The `Datasheet` type stored on the topic:

```text
interface Datasheet {
  content: string;
  generatedAt: string;
  prompt?: string;
  selectedSections: string[];
}
```

