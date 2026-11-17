# Implementation details

## Native structure, verified on 4.0.6

- `#siteNav > ul` contains the native hierarchy; child lists have `.other-section`, active anchors `.active`. Keep original href values and their query/hash semantics.
- Main content: `main.page`, `.main-header`, `.package-title`, `.page-title`, `.page-content`. Blocks: `.box`, `.box-head`, `.box-title`, `.box-content`. Navigation: `.nav-buttons`.
- Theme JS runs in learner exports/preview; it does not replace the editor's chapter tree.
- The starter moves the existing nav into `dialog#st-drawer`, adds `#st-menu-toggle`, search and subgroup buttons. No external JavaScript dependencies are introduced. `showModal()` provides a modal focus boundary; closing returns focus to the trigger. Search is over titles, not course body content. It does not track learning completion.
- Maintain no-JS access to the native outline. Do not use CSS that hides the only navigation before the menu script initializes.
- Use explicit hidden-state selectors inside the drawer so base theme rules cannot re-show collapsed lists. Take screenshots after the short entry animation settles. In a focused native search input, the first Escape may clear the field; test dialog dismissal with focus outside the search input as well.
- Keep large tables/media usable without adding page-wide overflow. Some iDevices have independent fixed-size layouts and require targeted review.

## Brand adaptation

Skilltech seed: white/black, navy `#112c47`, yellow `#f1bb45`, Plus Jakarta Sans, rounded buttons, light borders, restrained spacing. Local fonts avoid third-party requests. Fonts/icons/base CSS each retain attribution; adaptation licensing does not replace font licences or trademark terms.

Edit the CSS override layer first; avoid changing base behavior and native controls unnecessarily. If copying to another theme, update config slug/title/version, any visible brand string in style.js, the screenshot and attribution. Preserve a traceable distinction between copied source and new code.

## Portable packaging

ZIP root: config.xml, style.css, style.js, optional extra CSS, screenshot.png and resource folders. No enclosing theme folder. All entry names use `/`; Windows backslashes are not portable and can survive through the browser importer into a SCORM ZIP. The supplied PowerShell packer writes entries with ZipArchive instead of Compress-Archive, rejects reparse points and validates relative CSS resources.

Use Node readFileSync/writeFileSync with `utf8`, or explicit PowerShell UTF-8, for textual transformations. Default legacy PowerShell decoding can corrupt accented text. Never use a text read/write to copy binary assets.

Useful upstream documentation in this workspace: `source/doc/development/styles.md`, `source/doc/elpx-format/themes.md`. Treat runtime assets as authoritative for the installed version.
