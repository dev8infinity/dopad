export const createImage = (options: { src: string }) => {
  options = options || {};
  const img = document.createElement("img");
  if (options.src) {
    img.src = options.src;
  }
  return img;
};

export const clipboardSupports = (mimeType: string) => {
  return ClipboardItem.supports(mimeType);
}
export const copyTextToClipboard = async (text: string | null) => {
  try {
    await navigator.clipboard.writeText(text || "");
    console.log("Text copied");
  } catch (error) {
    console.error(error);
  }
};
export const copyFileToClipboard = async (blob: Blob | null) => {
  if (!blob || !clipboardSupports(blob.type)) {
    return;
  }
  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob
      })
    ]);

    console.log("Image copied");
  } catch (error) {
    console.error(error);
  }
};
interface ImageEvent extends OffscreenCanvas{
  width: number;
  height: number;
}

function isImageEvent(e: object): e is ImageEvent {
  return 'width' in e && e.width != undefined && 'height' in e && e.height != undefined ;
}

export const convertToPng = (imgBlob: Blob) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const imageEl = createImage({ src: window.URL.createObjectURL(imgBlob) });
  imageEl.onload = (e) => {
    if (!e || !e.target || !isImageEvent(e.target)) {
      return;
    }
    canvas.width = e.target.width;
    canvas.height = e.target.height;
    ctx?.drawImage(e.target, 0, 0, e.target.width, e.target.height);
    canvas.toBlob(copyFileToClipboard, "image/png", 1);
  };
};

export const copyImg = async (src: string) => {
  const img = await fetch(src);
  const imgBlob = await img.blob();
  const extension = src.split(".").pop();
  const supportedToBeConverted = ["jpeg", "jpg", "gif"];
  if (supportedToBeConverted.indexOf(extension?.toLowerCase() || "")) {
    return convertToPng(imgBlob);
  } else if (extension?.toLowerCase() === "png") {
    return copyFileToClipboard(imgBlob);
  }
  console.error("Format unsupported");
};