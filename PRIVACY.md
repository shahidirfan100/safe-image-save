# Safe Image Save privacy policy

Last updated: 2026-09-22

Safe Image Save does not transmit personal data to the developer or any third party, and it does not sell personal data.

When you choose a format from the image context menu, the extension uses the browser's local page and canvas APIs to create the requested image file. The image is not sent to a developer server, analytics provider, affiliate network, or remote conversion service.

The extension stores your preferences and, when enabled, a small list of recent saves in the browser's local extension storage on your device. The history contains filenames, output formats, site names, dates, and file sizes. It does not store image pixels or full browsing history. You can turn history off or clear it from the extension popup.

The extension does not run an always-on content script and does not scan pages in the background. It acts after an explicit image right-click action. Some protected or cross-origin images cannot be read into a local canvas; those conversions are refused rather than sent elsewhere.

The public source repository is https://github.com/shahidirfan100/safe-image-save. A support contact will be added before public release.
