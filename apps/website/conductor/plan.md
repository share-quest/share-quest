# Implementation Plan: SVG and Title Replacement

## Objective

Replace the current SVG icons and the text title with images from the `src/assets` directory.

## Key Files & Context

- `src/App.tsx` (Contains all the components, SVG definitions, and the Header)
- `src/assets/` (Contains the JPG images)

## Implementation Steps

1. **Import Assets**: Add import statements at the top of `src/App.tsx` for the 6 images (`170805.jpg` to `170810.jpg`).
2. **Update Components**:
   We will automatically map the 6 images as follows:
   - `LogoIcon` will render `170805.jpg`
   - The Title ("SHARE Quest") will be replaced by `170806.jpg`
   - `CustomSearchIcon` will render `170807.jpg`
   - `CustomUserIcon` will render `170808.jpg`
   - `CustomStarIcon` will render `170809.jpg`
   - `CustomSettingsIcon` will render `170810.jpg`
3. **Refactor Code**:
   - Modify the functional components (`LogoIcon`, `CustomSearchIcon`, etc.) to return an `<img src={...} className={className} alt="..." />` instead of `<svg>`.
   - In the `Header` component, find `<span className="font-bold text-xl text-gray-800 tracking-tight hidden sm:inline-block">SHARE Quest</span>` and replace it with `<img src={...} className="h-8 hidden sm:inline-block" alt="SHARE Quest" />`.

## Verification & Testing

- Ensure that the app compiles successfully.
- Verify that the header and all icon buttons visually display the JPG images instead of the SVGs.
- Confirm the layout remains intact with the image replacements.
