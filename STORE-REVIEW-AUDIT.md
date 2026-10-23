# Store Review Audit — Safe Image Save 0.1.3

Audit date: 2026-10-23

## Verdict

The current source has a narrow permission set, a single purpose, no remote code or tracking, and explicit local-data explanations. Static checks pass for the menu lifecycle and X image path.

Do not claim this version is store-ready yet. A live Chrome/X.com smoke test has not been completed, the Chrome and Edge dashboards' privacy URLs and publisher/contact fields have not been verified, and two store screenshots still show the old permission/status copy.

## Verified product behavior

- Manifest/static checks confirm version 0.1.3, the exact optional `https://pbs.twimg.com/*` permission, and no broad host permission.
- Existing Node checks pass: unit checks, context-menu lifecycle checks, and manifest/syntax/permission/icon checks.
- `git diff --check` passes.
- Menu setup now runs on install/update only; it no longer recreates persistent context-menu entries at browser startup.
- X CDN fetch uses omitted credentials, no referrer, no cached response, and rejects redirects. A granted optional permission is required; denial prevents the request and download.
- X image bytes are converted locally and passed to Downloads as a data URL. Image and pixel limits are enforced, and the output MIME type is checked before saving.
- No live Chrome/X.com test was performed for this version. Earlier isolated Edge observations apply only to 0.1.2 and are not evidence for 0.1.3.

## Chrome Web Store review matrix

| Area | Result | Evidence / action |
|---|---|---|
| Single purpose | Pass | Only converts the image explicitly chosen from the image context menu. |
| Minimum permissions | Pass | `activeTab`, `scripting`, `contextMenus`, `downloads`, `storage`, and `alarms`; one optional `https://pbs.twimg.com/*` origin is requested only after an image action. No broad host access or always-on content script. |
| User data disclosure | Conditional | Source privacy copy describes the optional X CDN request; verify the public privacy URL and dashboard disclosures before submission. |
| Remote code / hidden behavior | Pass | No remote code, analytics, affiliate, or feature-flag path was found in the runtime files. The selected X image is fetched from its CDN only after the user invokes the menu action and grants optional access. |
| Listing accuracy | Conditional | Draft listing copy describes explicit action, local conversion, format limitations, and first-frame GIF behavior; the published dashboard listing was not verified. |
| Graphics | Conditional | Dimensions are valid, but popup and privacy screenshots contain stale status/permission copy and must be refreshed. |
| Publisher/support | Blocked until supplied | Add publisher identity, contact email, support URL, and source URL. |

## Edge Add-ons review matrix

| Area | Result | Evidence / action |
|---|---|---|
| Single purpose | Pass | Narrow image-format conversion utility. |
| Permission minimization | Pass | No broad host access, browsing-history access, or content script. X CDN access is optional and fetched without cookies or a page referrer. |
| Browser-neutral listing | Pass after copy update | `EDGEADDONS.md` avoids Chrome-specific product copy; the in-extension UI now says “your browser.” |
| Privacy page | Conditional pass | Local handling is documented; a reachable privacy URL is still required. |
| Screenshot quality | Conditional | Dimensions are valid; refresh the popup and privacy screenshots to match version 0.1.3. |
| Package integrity | Not verified for 0.1.3 | Static checks pass, but this version has not been loaded in Edge Chromium. |
| Publisher/support | Blocked until supplied | Complete Partner Center publisher and contact fields. |

## Manual release smoke still required

Load version 0.1.3 in Chrome, refresh the target page after loading the extension, and test X twice (accepting and denying the optional permission). Then test a same-origin page, a WebP/AVIF image, a WordPress media page, a stock-asset page, an animated GIF, and a protected/internal page. Confirm the downloaded bytes and page toast. Repeat the applicable checks in Edge before claiming Edge runtime support. Rebuild the popup and privacy screenshots, and verify the store dashboards' privacy URL and publisher/contact fields before submission.
