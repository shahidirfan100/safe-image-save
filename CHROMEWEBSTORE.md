# Chrome Web Store Listing — Safe Image Save

> Last Updated: 2026-10-23

## Store Listing

**Extension Name**

Safe Image Save

**Short Description**

Save a chosen web image as PNG, JPG, WebP, or AVIF with local-only conversion.

**Detailed Description**

Save a web image in the format you actually need, without sending it to a converter website.

Right-click an image and choose Safe Image Save. Pick PNG, JPG, WebP, or AVIF when your browser can encode it. Set JPG/WebP quality, choose a filename rule, and keep an optional local list of recent saves.

Safe Image Save only acts after your explicit image right-click action. It does not upload images, use accounts, inject affiliate links, run analytics, or scan every image on a page.

Some sites block local pixel access. For an image hosted by X's `pbs.twimg.com` CDN, Chrome asks for optional access after you choose the image. If allowed, only the selected image is fetched, without cookies or a page referrer, and converted locally. Other protected hosts are reported instead of silently downloading a file in the wrong format. Animated GIFs become a still first frame when exported to another format.

**Category**

Photos

**Single Purpose**

Converts a user-selected web image into a chosen local image format.

**Primary Language**

English

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon | 128×128 PNG | ✅ Ready | icons/icon-128.png |
| Screenshot 1 | 1280×800 | ✅ Ready | store-assets/screenshot-01-right-click-flow-1280x800.png |
| Screenshot 2 | 1280×800 | ✅ Ready | store-assets/screenshot-02-settings-1280x800.png |
| Screenshot 3 | 1280×800 | ✅ Ready | store-assets/screenshot-03-privacy-1280x800.png |
| Small Promo Tile | 440×280 | ✅ Ready | store-assets/promo-small-440x280.png |
| Marquee Promo Tile | 1400×560 | ✅ Ready | store-assets/promo-marquee-1400x560.png |

### Screenshot Notes

1. A clear visual of the image right-click flow and the four output formats.
2. Refresh the extension popup screenshot after changing the status label to Local conversion.
3. Refresh the privacy/limits screenshot to show the optional X image-host permission and the cookie/referrer protections.

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| activeTab | permissions | Gives temporary access to the current page only after the user chooses an image action, so the selected image can be converted locally. |
| scripting | permissions | Runs the one-time conversion function in the selected tab; no content script runs continuously. |
| contextMenus | permissions | Adds the Safe Image Save submenu to image right-click menus. |
| downloads | permissions | Sends the locally converted file through the browser's normal download flow. |
| storage | permissions | Stores settings and the optional recent-save list on the device. |
| alarms | permissions | Clears the extension's short-lived success or error badge. |
| https://pbs.twimg.com/* | optional host permission | After the user selects an X image, allows the extension to fetch that one image without cookies or a page referrer so it can convert the image locally. The permission is not requested during installation. |

## Privacy & Data Use

### Data Collection

**Does the extension transmit user data to a developer or third party?** No

The extension processes the image explicitly selected by the user and the optional save history on the device. It does not send converted image pixels, filenames, site names, or settings to a developer server, analytics service, affiliate network, or remote conversion API. The selected image is requested from its source; for X, the optional `pbs.twimg.com` request omits cookies and the page referrer. The source host still receives its normal network request.

### Data Use Certification

- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

## Privacy Policy

**Privacy Policy URL** [REQUIRED]

Add the public privacy-policy URL before store submission.

## Distribution

**Visibility**: Unlisted for concierge testing; Public after release review
**Regions**: All regions

## Developer Info

**Publisher Name** [REQUIRED]

Add publisher name before submission.

**Contact Email** [REQUIRED]

Add support email before submission.

**Support URL / Email** [RECOMMENDED]

Public source repository: https://github.com/shahidirfan100/safe-image-save
Add the final support issue tracker or email before submission.

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 0.1.3 | 2026-10-23 | Stopped rebuilding persistent context-menu entries at browser startup; added user-approved, cookie-free local conversion for X images and large-image safeguards. | Draft |
| 0.1.2 | 2026-09-23 | Prevented duplicate context-menu registration when install and startup events overlap; added retry-safe setup and regression coverage. | Draft |
| 0.1.1 | 2026-09-22 | Runtime QA pass, callback-safe context-menu lifecycle, browser-neutral UI, verified store assets, popup overflow fix, and shared converter test coverage. | Draft |
| 0.1.0 | 2026-09-22 | Initial local-only PNG/JPG/WebP/AVIF conversion MVP. | Draft |

## Review Notes

### Known Issues / Limitations

- Other sites may prevent local image conversion. X image conversion asks for optional `pbs.twimg.com` access on the user's first selected image.
- AVIF is enabled only when the browser returns an actual AVIF blob.
- Exporting an animated GIF to another format saves the first frame.
- A public privacy-policy URL, publisher identity, support contact, dashboard listing entry, and final screenshot upload remain manual release steps.
