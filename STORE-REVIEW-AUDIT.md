# Store Review Audit — Safe Image Save 0.1.2

Audit date: 2026-09-22

## Verdict

The code and unpacked MV3 behavior are low-risk for Chrome Web Store and Edge Add-ons review. The extension has a single purpose, uses a narrow permission set, contains no remote code or tracking, and has explicit local-data explanations.

It is not yet ready for a public submission claim. The remaining blockers are publisher metadata outside the package: a reachable privacy-policy URL, publisher identity/contact details, and one manual smoke test in the user's own browser profile. The public source repository is now configured in the extension.

## Verified product behavior

- Manifest V3 loads as version 0.1.2 in an isolated Edge Chromium profile.
- Service worker is registered and the extension record is enabled.
- Popup opens, renders the local-only status, reports the manifest version, and has no body horizontal overflow.
- Preferred format and quality persist across popup reloads.
- Local history renders hostile-looking filename text as text rather than markup; clear history removes it.
- PNG, JPG, and WebP return the requested MIME type from the actual canvas encoder.
- AVIF returns a clear capability message when the browser encoder is unavailable; no mislabeled file is accepted.
- Invalid image data, `javascript:` URLs, and `file:` URLs are rejected before conversion.
- Privacy/about page renders and explains permissions, local processing, and browser limitations.
- Context-menu removal and recreation are callback-sequenced for the declared Chrome 109+ floor instead of relying on the newer Promise form.
- Static checks pass for JavaScript syntax, permissions, referenced files, icons, store dimensions, and converter MIME validation.
- Package audit confirms the ZIP contains runtime files only; store drafts, tests, and build tools are excluded.

The intentionally expected console message during the invalid-image test is the browser's failed resource load. No unexpected page, popup, or about-page errors were found.

## Chrome Web Store review matrix

| Area | Result | Evidence / action |
|---|---|---|
| Single purpose | Pass | Only converts the image explicitly chosen from the image context menu. |
| Minimum permissions | Pass | `activeTab`, `scripting`, `contextMenus`, `downloads`, `storage`, `alarms`; no host permissions or always-on content script. |
| User data disclosure | Conditional pass | Local image handling and optional history are documented; add the public privacy URL in the dashboard. |
| Remote code / hidden behavior | Pass | No fetch, XHR, WebSocket, remote script, analytics, affiliate, or feature-flag path in runtime files. |
| Listing accuracy | Pass | Description states explicit action, local conversion, format limitations, and first-frame GIF behavior. |
| Graphics | Pass | Real icon, three 1280×800 screenshots, 440×280 promo, and 1400×560 marquee are prepared. |
| Publisher/support | Blocked until supplied | Add publisher identity, contact email, support URL, and source URL. |

## Edge Add-ons review matrix

| Area | Result | Evidence / action |
|---|---|---|
| Single purpose | Pass | Narrow image-format conversion utility. |
| Permission minimization | Pass | No broad host access, browsing-history access, or content script. |
| Browser-neutral listing | Pass after copy update | `EDGEADDONS.md` avoids Chrome-specific product copy; the in-extension UI now says “your browser.” |
| Privacy page | Conditional pass | Local handling is documented; a reachable privacy URL is still required. |
| Screenshot quality | Pass | Exact dimensions and no stretched app screenshot. |
| Package integrity | Pass | Same MV3 runtime package can be loaded in Edge Chromium. |
| Publisher/support | Blocked until supplied | Complete Partner Center publisher and contact fields. |

## Manual release smoke still required

Load the unpacked folder in the user's Chrome profile, refresh the target page after loading the extension, and test one image each on a normal same-origin page, a WebP/AVIF page, a WordPress media page, a stock-asset page, an animated GIF, and a protected/internal page. Confirm the downloaded bytes and the page toast. The isolated Edge test is strong runtime evidence, but it is not proof of the user's authenticated Chrome profile or every live website's CORS behavior.
