

## Fix Plus/Minus Button Confusion in Secret Shows Gift Leaders

### Problem
There are two buttons next to each other that both show the same icon (both Plus or both Minus). The first is a toggle button to switch between add/subtract mode, and the second is the submit button. This is confusing because they look nearly identical.

### Solution
- Change the **toggle button** to always show both Plus and Minus with a slash (or use a `ArrowUpDown`/`RefreshCw` icon) to indicate it's a mode switcher -- or better, replace it with a small visual label like "+/-"
- Change the **submit button** to show a clear action: "Add" text when adding, "Remove" text when subtracting, keeping the colored styling to indicate which mode is active

### Changes

**`src/components/studio/SecretShowsLeaderboard.tsx`**
- Toggle button (line 87-94): Change content to "+/−" text so it's clearly a mode switcher, not an action button
- Submit button (line 95-97): Keep the Plus/Minus icon but also add "Add"/"Remove" text label for clarity

