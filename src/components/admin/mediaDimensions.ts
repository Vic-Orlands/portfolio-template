export type MediaDimensions = {
  width?: number;
  height?: number;
};

export async function getFileMediaDimensions(
  file: File,
  mediaType: "image" | "video",
): Promise<MediaDimensions> {
  try {
    if (mediaType === "image") {
      const bitmap = await createImageBitmap(file);
      const dimensions = { width: bitmap.width, height: bitmap.height };
      bitmap.close();
      return dimensions;
    }

    const url = URL.createObjectURL(file);
    try {
      return await new Promise<MediaDimensions>((resolve) => {
        const video = document.createElement("video");
        const finish = () => {
          video.removeAttribute("src");
          video.load();
        };
        video.preload = "metadata";
        video.onloadedmetadata = () => {
          const dimensions = {
            width: video.videoWidth || undefined,
            height: video.videoHeight || undefined,
          };
          finish();
          resolve(dimensions);
        };
        video.onerror = () => {
          finish();
          resolve({});
        };
        video.src = url;
      });
    } finally {
      URL.revokeObjectURL(url);
    }
  } catch {
    return {};
  }
}

export async function getImageDimensions(
  url: string,
): Promise<MediaDimensions> {
  return await new Promise((resolve) => {
    const image = new Image();
    image.onload = () =>
      resolve({
        width: image.naturalWidth || undefined,
        height: image.naturalHeight || undefined,
      });
    image.onerror = () => resolve({});
    image.src = url;
  });
}
