export function retrieveFileFromClipboardAsBase64(pasteEvent: React.ClipboardEvent<HTMLDivElement>, callback: (base64: string | undefined, isImage: boolean) => void) {
    // Retrieve elements from clipboard
    const items = pasteEvent.clipboardData?.items;

    if (items == undefined) {
        callback(undefined, false);
        return;
    }

    for (let i = 0; i < items.length; i++) {

        // Retrieve file on clipboard as a blob
        const blob = items[i].getAsFile();

        if (blob === null) {
            // If blob is null, skip to the next item
            continue;
        }

        // Convert the file blob to base64
        const reader = new FileReader();
        reader.onloadend = function () {
            // Execute callback with the base64 URI of the file
            if (typeof callback === "function") {
                callback(reader.result as string, blob.type.indexOf('image') != -1);
            }
        };

        // Read the blob as a Data URL (Base64 string)
        reader.readAsDataURL(blob);
    }
}
