# Safe Image Save build plan

## Product boundary

Safe Image Save is a narrow, privacy-first replacement for the browser's missing image-format save action. The MVP converts only the image the user explicitly selects from the right-click menu. It does not include AI editing, batch page galleries, cloud conversion, accounts, analytics, affiliate code, or background page scanning.

## User flow

Install -> open a page -> right-click an image -> choose Safe Image Save -> choose PNG, JPG, WebP, or AVIF -> Chrome downloads the local result -> the extension shows a small confirmation and optionally records a local history item.

## Technical plan

1. Use Manifest V3 with a module service worker.
2. Use `contextMenus` to expose one image-only parent menu with four format actions.
3. Use `activeTab` and `scripting` only after the context-menu gesture to run a page-local canvas conversion.
4. Validate the actual returned MIME type before downloading so unsupported AVIF/WebP encoders cannot create a mislabeled PNG.
5. Use `downloads` for the normal Chrome download flow.
6. Use `storage.local` for settings and an optional eight-item history.
7. Use `alarms` to clear the success/error badge without keeping service-worker state in memory.
8. Use an injected toast plus a badge for action feedback.

## Permission decision

Required: `activeTab`, `scripting`, `contextMenus`, `downloads`, `storage`, `alarms`.

Optional: `https://pbs.twimg.com/*`, requested only after the user selects an X image. The service worker fetches only that image with credentials omitted and no referrer so local canvas conversion can work when the page's CORS policy blocks it.

Intentionally omitted: required host permissions, `tabs`, `notifications`, offscreen documents, web-accessible resources, and content scripts. The optional CDN access is never requested during installation.

## UX direction

Dark precision utility UI: navy background, green local-status signal, orange utility accent, readable system typography, visible focus rings, compact controls, and no decorative icons that compete with the task. The popup explains the privacy boundary before the settings. Copy is plain and specific: no hype, no vague security promises, and no claim that every image can be converted.

## Test and release gates

- Syntax check all JavaScript files.
- Unit-test filename sanitizing, source-name extraction, filename rules, settings normalization, and format checks.
- Verify manifest permissions, referenced files, and PNG magic bytes/dimensions.
- Package only the extension source files into a ZIP and list its contents.
- Manually load the unpacked extension in Chrome and test X images with both permission acceptance and denial, one same-origin image, WebP/AVIF output, one cross-origin/protected image, one animated GIF, a very large image, and an internal page.
- Manually confirm three conversions on Google Images, a WordPress media page, and a stock-asset page before calling runtime behavior verified.

## Validation decision

The product hypothesis is GO when 10 of 20 concierge testers complete at least two conversions and five request release. Pivot toward a PNG/WebP-focused tool if testers rarely use the other formats. Stop if fewer than six testers complete a second conversion or supported-image failures exceed 10%.
