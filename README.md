# Safe Image Save

Safe Image Save is a local-only Manifest V3 browser extension for saving a chosen web image as PNG, JPG, WebP, or AVIF when the browser can encode the requested format.

The extension has one focused interaction: right-click an image, choose Safe Image Save, and pick the output format. It does not upload images, inject affiliate links, run analytics, or scan every image on a page.

## Load it locally

1. Open `chrome://extensions`.
2. Turn on Developer mode.
3. Choose **Load unpacked** and select this folder.
4. Open a normal web page, right-click an image, and choose **Safe Image Save**.

## Known limits

- Cross-origin rules can prevent a site image from being read into a local canvas. The extension reports that failure instead of downloading a mislabeled file.
- Choosing PNG, JPG, WebP, or AVIF for an animated GIF exports the first frame.
- AVIF is capability-detected. If the browser does not return an AVIF blob, no file is downloaded.
- Browser internal pages and some protected pages do not allow injected conversion code.

## Before public release

- The public source repository URL is configured in `shared/constants.js` and linked from the popup.
- Add the final privacy-policy URL and publisher details to `CHROMEWEBSTORE.md`.
- Use the ready-to-upload files in `store-assets/` for the Web Store listing.
- Run the manual browser smoke test in the release checklist.
