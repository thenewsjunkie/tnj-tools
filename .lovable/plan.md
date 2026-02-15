

## Remove Potential Videos from Show Prep

### Changes

**1. `src/components/admin/ShowPrep.tsx`**
- Remove the `potentialVideos` state variable and its setter
- Remove `handleClearPotentialVideos` function
- Remove the `Video` icon import from lucide-react
- Remove `potentialVideos` from the debounced save effect and the `loadData` function
- Remove the entire "Potential Videos" UI block (textarea, clear button, heading)

**2. `src/components/admin/show-prep/PrintShowPrep.tsx`**
- Remove `potentialVideos` from the `PrintData` interface
- Remove the "Potential Videos" HTML block from the generated print document
- Remove the `.potential-videos` CSS styles

