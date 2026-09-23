export async function convertImageInPage(srcUrl, format, quality) {
  const config = {
    png: { mime: 'image/png' },
    jpg: { mime: 'image/jpeg' },
    webp: { mime: 'image/webp' },
    avif: { mime: 'image/avif' }
  }[format];
  if (!config) return { ok: false, message: 'That output format is not available.' };

  try {
    const parsedSource = new URL(srcUrl, location.href);
    if (!['http:', 'https:', 'data:', 'blob:'].includes(parsedSource.protocol)) {
      return { ok: false, message: 'This image URL cannot be read safely by the local converter.' };
    }
    const source = parsedSource.href;
    const image = new Image();
    if (!source.startsWith('data:') && !source.startsWith('blob:')) image.crossOrigin = 'anonymous';
    image.decoding = 'async';
    image.src = source;
    if (image.complete && image.naturalWidth > 0) {
      await image.decode().catch(() => undefined);
    } else {
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error('The image could not be loaded for local conversion.'));
      });
    }

    const width = image.naturalWidth;
    const height = image.naturalHeight;
    if (!width || !height) return { ok: false, message: 'The image has no readable dimensions.' };
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { alpha: format !== 'jpg' });
    if (!context) return { ok: false, message: 'Your browser could not create a conversion canvas.' };
    if (format === 'jpg') {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, width, height);
    }
    context.drawImage(image, 0, 0);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, config.mime, quality));
    if (!blob) return { ok: false, message: 'The browser could not encode this image.' };
    if (blob.type !== config.mime) {
      return {
        ok: false,
        message: format === 'avif'
          ? 'AVIF encoding is not available in this browser yet.'
          : `This browser did not produce a valid ${format.toUpperCase()} file.`
      };
    }
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('The converted file could not be prepared for download.'));
      reader.readAsDataURL(blob);
    });
    return {
      ok: true,
      dataUrl,
      bytes: blob.size,
      sourceUrl: source,
      pageTitle: document.title,
      domain: location.hostname.replace(/^www\./i, ''),
      isGif: /\.gif(?:$|[?#])/i.test(source)
    };
  } catch (error) {
    return { ok: false, message: error?.name === 'SecurityError' ? 'This image blocks local conversion because of its cross-origin policy.' : error.message };
  }
}
