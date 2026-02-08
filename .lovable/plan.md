

## Improve Datasheet Print Layout

Based on the screenshot, the current printout has several readability issues: too much vertical spacing between bullets, section headers that don't pop, and no visual emphasis on key data. Here's what will change:

### Changes to `src/components/admin/show-prep/PrintDatasheet.tsx`

**1. Tighter bullet spacing**
- Reduce line spacing between bullet points from the current loose layout to tight 1-2px margins
- Remove the extra paragraph spacing that's doubling gaps between items

**2. Bold, visually distinct section headers**
- Add a green background bar/highlight behind section headers (e.g., "BASIC DETAILS", "TIMELINE") so they jump off the page
- Use white text on the green background for contrast
- Add slight padding to make them look like labeled tabs

**3. Highlight key data automatically**
- Bold any dates, numbers, and percentages in the content using regex patterns
- Style names/proper nouns that appear in bold markdown more prominently with a darker color

**4. Better content formatting**
- Wrap bullet lists in proper `<ul>` tags instead of loose `<li>` elements for correct indentation
- Reduce overall line-height from 1.3 to 1.25 to pack more on the page
- Tighten margins on `<p>` and `<li>` elements

**5. Two-column layout for Timeline sections**
- When timeline data is present, format date entries with the date portion left-aligned in a fixed-width column and the description to the right, making it scannable

### Summary of visual improvements

```text
BEFORE:                          AFTER:
                                 
BASIC DETAILS                    [====BASIC DETAILS====] (green bar)
  * loose bullet                   * tight bullet
                                   * tight bullet
  * loose bullet                 
                                 [======TIMELINE=======] (green bar)
TIMELINE                           Apr 2022 | Event description
  * loose date + text              Apr 2023 | Event description
```

All changes are contained in `PrintDatasheet.tsx` -- no other files affected.

