export function retrieveImageFromClipboardAsBase64(pasteEvent: React.ClipboardEvent<HTMLDivElement>, callback: (base64: string | undefined) => void) {
    // retrive elements from clipboard
    const items = pasteEvent.clipboardData?.items;

    if (items == undefined) {
        callback(undefined);
        return;
    };

    for (let i = 0; i < items.length; i++) {
        // Skip content if not image
        if (items[i].type.indexOf("image") == -1) continue;
        // Retrieve image on clipboard as blob
        const blob = items[i].getAsFile();

        if (blob === null) {
            // If blob is null, skip to the next item
            continue;
        }
        // Create an abstract canvas and get context
        const mycanvas = document.createElement("canvas");
        const ctx = mycanvas.getContext('2d') as CanvasRenderingContext2D;

        // Create an image
        const img = new Image();

        // Once the image loads, render the img on the canvas
        img.onload = function () {

            const image = this as HTMLImageElement;
            // Update dimensions of the canvas with the dimensions of the image
            mycanvas.width = image.width;
            mycanvas.height = image.height;

            // Draw the image
            ctx.drawImage(img, 0, 0);
            
            // Execute callback with the base64 URI of the image
            if (typeof (callback) == "function") {
                callback(mycanvas.toDataURL(
                    ("image/png")
                ));
            }
        };

        // Crossbrowser support for URL
        const URLObj = window.URL || window.webkitURL;

        // Creates a DOMString containing a URL representing the object given in the parameter
        // namely the original Blob
        img.src = URLObj.createObjectURL(blob);
    }
}