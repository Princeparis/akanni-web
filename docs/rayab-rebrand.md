# Rayab logo integration

The three SVGs from the owner's `rayab_svg_package.zip` are preserved byte-for-byte in `public/brand/rayab/`.

- **Header, menu, and introduction:** the icon from `rayab_icon.svg`. The navigation remains icon-only and keeps its scroll-driven size animation.
- **Footer:** the wordmark from `rayab_wordmark.svg`, sized to the existing wide signature area. Its five letter paths and accent rectangle participate in the existing GSAP reveal.
- **Browser icons:** the new monogram on a dark tile, with a matching 180px Apple touch icon. The conventional `/favicon.svg` is updated as well as the metadata URLs.
- **Combined lockup:** `rayab_logo_lockup.svg` remains available as an original asset for future use.

The inline components retain every supplied path and accent coordinate. Their viewboxes trim empty export padding so the actual marks align with the interface. Dark surfaces retain the white/lime treatment; the light menu and lime footer use a dark monochrome treatment for legibility. The SVGs use scoped fills instead of importing the source's global `.w`/`.g` stylesheet classes.

Typography, contact details, written portfolio content, page layouts, playground tools, and loader choreography are unchanged. The home links' accessible names now identify Rayab.
