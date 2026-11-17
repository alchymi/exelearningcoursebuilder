---
name: exelearning-theme-builder
description: Create, customize, package and troubleshoot eXeLearning course themes from a visual identity, including responsive layouts and chapter navigation. Use for eXe templates, styles, branding and theme previews; use the course-builder skill for lesson content rather than theming.
---

# eXeLearning theme builder

Create a reusable course theme ZIP, not a screenshot mockup or a redesign of the authoring application. Preserve the requested visual identity and the native activity/SCORM behavior.

## Starting point

- Inspect the provided style pack or existing brand files first. Distinguish semantic tokens from merely observed values; use local fonts/assets with their attribution and licence.
- Inspect one export from the running eXe version. Upstream main and installed versions can have different markup and theme resolution.
- `assets/skilltech-drawer/` is a working 4.0.6 starter with local fonts, base icons, attributed base CSS and an accessible hamburger drawer. Copy it to a new theme directory and change its identity/appearance when appropriate. For this workspace, edit the live theme at `themes/skilltech-drawer/`; the bundled starter is a seed, not another source of truth.
- Preserve user scope: preparing a theme does not mean applying it to every course, publishing content, changing the instance default or modifying editor navigation.

## Implementation

Theme roots contain `config.xml`, `style.css`, optional root JS/additional CSS, real `screenshot.png`, icons and font/image subfolders. Keep `<name>` equal to the directory and ZIP stem, using a simple lowercase slug. Include title, version, compatibility, author and licence metadata. Root CSS files load alphabetically; the starter's overrides are in `zz-skilltech.css`.

Use [references/implementation.md](references/implementation.md) when changing navigation or packaging. Preserve native page links, `.nav-buttons`, activity markup/IDs, runtime scripts and assessment integration. Avoid broad overrides of game controls or a replacement single-page router that bypasses eXe navigation.

For the local Skilltech design, default to the user's closed hamburger drawer on mobile **and desktop**, repliable sections, searchable titles and current-page indication. Other brands/tasks may call for different navigation. The starter supports French and English; adapt labels to the course language.

Capture a real screenshot of the finished theme and replace the thumbnail before delivering. Do not retain a base-theme preview under a new theme name.

Package on Windows with:

```powershell
powershell -NoProfile -File <skill>/scripts/pack-theme.ps1 -ThemeDir <theme-directory> -OutZip <output>/<theme-name>.zip
```

## Verify the actual delivery path

Check responsive pages in a browser at narrow and desktop widths, then check a fresh authenticated eXe session. Exercise menu opening, search, nested sections, real chapter links, Escape/focus return, previous/next, and representative activities. Inspect console errors, failed resources and horizontal overflow; view the screenshots.

If delivering SCORM, inspect ZIP paths/resources/manifest. Report LMS tracking as unverified unless tested in an LMS. A native game may need additional mobile adaptation beyond the theme.

If the user uses public links or asks to install for everyone, read [references/deployment.md](references/deployment.md). **A successful browser preview is not proof that a public shared URL uses the same theme.** Verify the exact anonymous link, including its content iframe, after changes.

Report the ZIP, selector name, where it was actually applied and what was tested. Keep reusable operational notes in workspace memory without credentials.
