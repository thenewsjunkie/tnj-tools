

## Fix: Leaderboard Readability in OBS Overlay

### Problem
The `SecretShowsLeaderboard` uses Tailwind's `sm:` breakpoint (640px) for readable text sizes. In your OBS setup, the panel is ~300px wide, so it never hits those breakpoints -- you're stuck with the tiny base sizes (`text-sm`, `text-base`, etc.).

### Solution
Add an OBS-specific CSS override in `src/index.css` that targets the leaderboard when rendered inside the OBS overlay context (the `body.obs-overlay` class is already applied). This avoids changing anything on the standalone `/secret-shows-leaderboard` page.

### Changes

**`src/index.css`** -- Add a new CSS block:
- Target `body.obs-overlay` descendants to boost leaderboard readability
- Increase font sizes for rank numbers, usernames, and gift counts
- Increase row padding for better spacing
- Slightly increase logo size
- Make the subtitle text larger
- Reduce the `min-h-screen` to just fill available space without forcing scroll

**`src/pages/SecretShowsLeaderboard.tsx`** -- Add a CSS class to the outer container:
- Add a class like `secret-shows-leaderboard` to the root div so the CSS can target it specifically (rather than using fragile descendant selectors)

This keeps the standalone leaderboard page unchanged while making the OBS overlay version significantly more readable with larger, bolder text.

### Technical Details

CSS overrides will include:
```css
body.obs-overlay .secret-shows-leaderboard {
  min-height: auto;
  padding: 0.5rem;
}
body.obs-overlay .secret-shows-leaderboard .leaderboard-rank { font-size: 1.5rem; }
body.obs-overlay .secret-shows-leaderboard .leaderboard-username { font-size: 1.1rem; }
body.obs-overlay .secret-shows-leaderboard .leaderboard-score { font-size: 1.25rem; }
body.obs-overlay .secret-shows-leaderboard .leaderboard-row { padding: 0.625rem 0.75rem; }
```

We'll add these semantic class names alongside the existing Tailwind classes in the component (no visual change on its own -- only activated by the CSS when inside OBS overlay).

