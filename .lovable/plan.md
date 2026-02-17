

## Remove Audio Feature from Admin Page

Revert the changes just made to `src/pages/Admin.tsx` to remove the Audio button and iframe panel.

### What changes

**`src/pages/Admin.tsx`**

1. Remove the `Headphones` import from lucide-react.
2. Remove the `isAudioOpen` state and its localStorage persistence (`useEffect`).
3. Remove the "Audio" pill button from the top action buttons row.
4. Remove the expandable Audio iframe panel.

Everything else stays as-is. The button row will go back to just `[Ask TNJ AI] [+ Poll]`.

