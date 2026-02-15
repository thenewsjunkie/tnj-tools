

## Add Rundown Indicator to Daily Printout

Add a visible badge next to any topic title on the daily printout that has a Rundown (strongman) attached, so it stands out at a glance.

### What changes

On the printed show prep document, any topic with a `strongman` property will display a bold "RUNDOWN" badge inline with the topic title. The badge will have a purple background with white text, making it immediately noticeable when scanning the page.

### Visual result

Topics without a rundown print as before:
> **Immigration bill passes committee**

Topics with a rundown get a badge:
> **[RUNDOWN]** **Immigration bill passes committee**

### File to modify

**`src/components/admin/show-prep/PrintShowPrep.tsx`**

1. Add a `.rundown-badge` CSS class: small inline label with purple background (`#7c3aed`), white text, rounded corners, uppercase, slightly smaller font size.
2. In the topic rendering loop, check `topic.strongman?.content` -- if truthy, prepend the badge before the topic title.

### Technical details

Single file change. In the topic `.map()` block (around line 190), add a conditional badge:

```html
${topic.strongman?.content ? '<span class="rundown-badge">RUNDOWN</span> ' : ''}
```

CSS for the badge:
```css
.rundown-badge {
  display: inline-block;
  background: #7c3aed;
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  vertical-align: middle;
  margin-right: 4px;
}
```

