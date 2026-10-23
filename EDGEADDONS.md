# Microsoft Edge Add-ons Listing — Safe Image Save

This is the browser-neutral listing draft for Edge Add-ons. Do not reuse Chrome-specific installation instructions or browser names in the Edge listing.

## Listing copy

**Name**

Safe Image Save

**Short description**

Save a chosen web image as PNG, JPG, WebP, or AVIF with local-only conversion.

**Detailed description**

Save a web image in the format you actually need, without sending it to a converter website.

Right-click an image and choose Safe Image Save. Pick PNG, JPG, WebP, or AVIF when the browser can encode it. Set JPG/WebP quality, choose a filename rule, and keep an optional local list of recent saves.

Safe Image Save only acts after your explicit image right-click action. It does not upload images, use accounts, inject affiliate links, run analytics, or scan every image on a page.

Some sites block local pixel access. For an image hosted on X's `pbs.twimg.com` CDN, the browser asks for optional access after you choose the image. If allowed, the extension requests only that image without cookies or a page referrer, then converts it locally. Other protected hosts are reported instead of silently downloading a file in the wrong format. Animated GIFs become a still first frame when exported to another format.

**Single purpose**

Converts a user-selected web image into a chosen local image format.

## Search terms

Enter these as six separate Edge Add-ons search terms:

1. `save image as png`
2. `save image as jpg`
3. `save webp image`
4. `save avif image`
5. `image format converter`
6. `local image converter`

These use 20 words total, keep each phrase under 30 characters, and stay within Edge's maximum of seven search terms.

## Privacy page declarations

- The extension handles the selected image and optional recent-save history locally on the device.
- It does not upload converted image pixels, filenames, site names, or settings to the developer or a remote conversion service. The selected image is requested from its source by the browser.
- For X images, optional access to `pbs.twimg.com` is requested only after an image is selected; the request omits cookies and the page referrer.
- It does not sell data, use analytics, inject affiliate links, or run a remote conversion service.
- Users can turn local history off or clear it from the extension popup.
- A public privacy-policy URL is required before submission.

## Permission explanations

| Permission | User-facing reason |
|---|---|
| `activeTab` | Temporarily access the current page after the user chooses an image action. |
| `scripting` | Run one conversion function in the selected tab; no always-on content script is installed. |
| `contextMenus` | Add the image right-click submenu. |
| `downloads` | Send the converted file through the browser's normal download flow. |
| `storage` | Store preferences and the optional recent-save list locally. |
| `alarms` | Clear the short-lived success or error badge. |
| `https://pbs.twimg.com/*` (optional) | Fetch the selected X image without cookies or a page referrer so the extension can convert it locally. |

## Review notes

- No required host permissions, content scripts, remote code, account, affiliate behavior, or hidden feature flag. One optional host permission is available for the selected X image CDN.
- The package contains the real 128px icon and browser-neutral 1280×800 screenshots.
- AVIF is capability-detected; the extension refuses to download a mislabeled file when the browser cannot encode AVIF.
- Cross-origin and protected-page failures are surfaced as user-readable limits; X conversion requires the optional image-CDN permission.
