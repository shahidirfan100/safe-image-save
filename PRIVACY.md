# Safe Image Save privacy policy

Last updated: 2026-10-23

Safe Image Save does not send image pixels, filenames, site names, or settings to the developer or a remote conversion service, and it does not sell personal data. The selected image is requested from its existing source by your browser; that source may receive the request and your normal network connection details.

When you choose a format from the image context menu, the extension converts the selected image locally in your browser. It does not upload image pixels to a developer server, analytics provider, affiliate network, or remote conversion service.

For images hosted on X's `pbs.twimg.com` CDN, Chrome asks for optional access after you select the image. If you allow it, the extension requests only the selected image with cookies omitted and no page referrer, then converts it locally. X's image CDN receives that request, but the converted pixels and local settings are not sent back to X, the developer, or a converter service. The permission is not requested during installation and can be revoked in Chrome's extension settings. If you deny it, no image is downloaded.

The extension stores your preferences and, when enabled, a small list of recent saves in the browser's local extension storage on your device. The history contains filenames, output formats, site names, dates, and file sizes. It does not store image pixels or full browsing history. You can turn history off or clear it from the extension popup.

The extension does not run an always-on content script and does not scan pages in the background. It acts after an explicit image right-click action. Some protected images on other sites cannot be read into a local canvas; those conversions are refused rather than sent elsewhere.

The public source repository is https://github.com/shahidirfan100/safe-image-save. A support contact will be added before public release.
