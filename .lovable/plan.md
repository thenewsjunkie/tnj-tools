
## Make Hall of Frame Photos Fill the Column on /output

### Problem
Currently, the Hall of Frame uses `object-contain` with max-height constraints, which leaves empty space around photos that don't match the container's aspect ratio. On the Output page, you want photos to zoom in and fill the entire column space.

### Approach
Pass a prop to the HallOfFrame component so it renders in a "fill" mode when used on the Output page. In fill mode, the image uses `object-cover` (which crops/zooms to fill) and expands to 100% of the container, instead of being constrained with `object-contain` and max-height.

### Changes

**`src/pages/HallOfFrame.tsx`**
- Add an optional `fillContainer` prop to the component
- When `fillContainer` is true:
  - Remove the padding, max-height constraints, and museum frame decorations
  - Make the image container fill the entire parent with `w-full h-full`
  - Use `object-cover` on the `<img>` tag so photos zoom/crop to fill
  - Keep the caption as a subtle overlay at the bottom
  - Keep transitions and slideshow logic unchanged
- When `fillContainer` is false (default): no changes, existing museum-frame look is preserved

**`src/pages/Output.tsx`**
- Change the hall-of-frame module component from rendering `HallOfFramePage` directly to a wrapper that passes `fillContainer={true}`:
  ```
  const OutputHallOfFrame = () => <HallOfFramePage fillContainer />;
  ```

### Result
On /output, every photo -- portrait, landscape, or square -- will zoom to completely fill its column. On standalone /hall-of-frame and OBS, the museum-frame style remains unchanged.
