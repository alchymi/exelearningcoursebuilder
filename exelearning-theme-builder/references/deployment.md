# Deployment and public viewer

These observations apply to the local 4.0.6 deployment verified on 2026-11-17. Recheck on other versions.

## Three different checks

1. User imports can live in IndexedDB and Yjs, working in browser preview and browser-generated exports.
2. The shared styles selector is built from server-discovered themes as well as user imports. Confirm a visible named card on another course, rather than merely a theme object in memory. A theme may be far down the scrollable Styles panel.
3. The anonymous `/view/<opaque-id>` viewer builds an HTML export server-side. The local FileSystemResourceProvider checked `public/files/perm/themes/base/<name>` and otherwise fell back to base; it did not consume this user theme from Yjs. Republishing alone did not fix it.

## Local persistent solution

Compose already mounts:

```yaml
- ./themes/skilltech-drawer:/app/public/files/perm/themes/base/skilltech-drawer:ro
```

This made the theme available to server exports and startup discovery in the common styles list. Keep custom files outside the container and retain the bind mount on updates. Do not overwrite the built-in `base` theme. On another deployment, first check official site-theme installation support and runtime provider resolution rather than assuming this workaround is necessary.

A Compose change requires container recreation; a plain restart does not apply a new mount. Validate with `docker compose config --quiet`, then use `docker compose up -d` within the authorized deployment scope. Briefly disclose the interruption. Never remove the data volume. In-memory public export caches may need invalidation/restart after filesystem-only theme changes; do not promise automatic refresh for every path.

## Verification and diagnosing stale views

- Get the exact shared URL, course and whether the user sees editor, preview, exported SCORM or public viewer. Internal UUIDs and public opaque IDs are different.
- Use fresh anonymous and authenticated browser contexts. For public views inspect the content iframe, not only the wrapper page. Check CSS/JS, loaded fonts, menu and actual chapter navigation at mobile width.
- Check server fallback logs and metadata before blaming Cloudflare or asking the user to republish repeatedly. Do not relax the iframe sandbox or expose authenticated resources to make a theme work.
- A localStorage SecurityError in the public sandbox was observed independently of the custom theme. Record its impact honestly; it did not prevent the verified menu/search/navigation flow.
- Replace screenshot.png with a genuine finished-theme capture and refresh the ZIP. Verify the picker thumbnail; a stale base thumbnail was mistaken for a missing theme.

Browser tooling locally: Playwright Core at `.agents/skills/exelearning-course-builder/scripts/node_modules/playwright-core`, Edge channel `msedge`. Existing `themes/` scripts are useful examples but contain specific course IDs and some perform mutations; inspect before adapting. Credentials should be read from `.env`, never stored in skill files or printed.
