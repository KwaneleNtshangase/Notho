// Dynamic import throughout this file is deliberate: @capacitor/share and
// @capacitor/filesystem are only installed once
// store-launch/_tools/setup-capacitor.sh has been run (plus the one-off
// `npm install @capacitor/filesystem` - see the comment on that dependency
// in package.json), and the web bundle should never need either. Callers
// get `false` back until the native shell exists, same pattern as
// isNativePlatform() in capacitorPlatform.ts.

/** Filesystem.writeFile wants raw base64, not a data: URL. */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result !== "string") { reject(new Error("Unexpected FileReader result")); return; }
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read blob"));
    reader.readAsDataURL(blob);
  });
}

async function writeCacheUri(blob: Blob, fileName: string): Promise<string | null> {
  try {
    const { Filesystem, Directory } = await import("@capacitor/filesystem");
    const base64Data = await blobToBase64(blob);
    await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Cache,
    });
    const { uri } = await Filesystem.getUri({
      path: fileName,
      directory: Directory.Cache,
    });
    return uri;
  } catch {
    return null;
  }
}

/** Write a blob into the app cache and return a WebView-safe URL for iframe preview. */
export async function cacheFilePreviewUrl(opts: {
  blob: Blob;
  fileName: string;
}): Promise<string | null> {
  try {
    const uri = await writeCacheUri(opts.blob, opts.fileName);
    if (!uri) return null;
    const { Capacitor } = await import("@capacitor/core");
    return Capacitor.convertFileSrc(uri);
  } catch {
    return null;
  }
}

/**
 * Hand a locally-generated file (e.g. the budget report PDF) to the native
 * share sheet. @capacitor/share can't share a Blob directly - it only takes
 * file:// paths - so this first writes the blob to the app's cache directory
 * via @capacitor/filesystem, then shares that path. The cache file is left
 * in place; Capacitor/the OS clean the cache directory over time, and the
 * report is cheap to regenerate if a user re-downloads it.
 *
 * Returns false (never throws) on the web, or if anything above fails, so
 * callers can fall back to the existing download-link / Web Share behaviour.
 */
export async function shareFileBlob(opts: {
  blob: Blob;
  fileName: string;
  title?: string;
  dialogTitle?: string;
}): Promise<boolean> {
  try {
    const { Share } = await import("@capacitor/share");
    const uri = await writeCacheUri(opts.blob, opts.fileName);
    if (!uri) return false;
    await Share.share({
      title: opts.title,
      dialogTitle: opts.dialogTitle,
      files: [uri],
    });
    return true;
  } catch {
    return false;
  }
}
