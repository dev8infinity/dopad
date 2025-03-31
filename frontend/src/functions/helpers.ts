import * as crypto from "crypto-js";
import { Attachment } from "../types";
import DOMPurify from 'dompurify';

export function sanitizeInput(text: string) {
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}
export function createHash(input: string) {
    const hash = crypto.SHA1(input);
    return hash.toString();
}
export function getValuesBetween(arr: Attachment[], index1: number, index2: number) {

    const values: Attachment[] = [];
    for (let i = Math.min(index1, index2); i <= Math.max(index1, index2); i++) {
        values.push(arr[i]);
    }
    if (index1 > index2) {
        return values.reverse();
    }
    return values;
}
export function deleteSubstring(str: string, startIndex: number, endIndex: number) {
    return str.slice(0, startIndex) + str.slice(endIndex);
}
export function getExtensionFromBlob(blob: Blob): string {
    const mimeToExt: Record<string, string> = {
        // Images
        "image/jpeg": "jpeg",
        "image/jpg": "jpg",
        "image/png": "png",
        "image/gif": "gif",
        "image/bmp": "bmp",
        "image/webp": "webp",
        "image/tiff": "tiff",
        "image/svg+xml": "svg",
        "image/x-icon": "ico",
        "image/heic": "heic",
        "image/heif": "heif",
    
        // Text
        "text/plain": "txt",
        "text/html": "html",
        "text/css": "css",
        "text/javascript": "js",
        "text/markdown": "md",
        "text/csv": "csv",
        "text/xml": "xml",
        "application/sql": "sql",
    
        // Documents
        "application/pdf": "pdf",
        "application/msword": "doc",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
        "application/vnd.ms-excel": "xls",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
        "application/vnd.ms-powerpoint": "ppt",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
    
        // Archives
        "application/zip": "zip",
        "application/x-rar-compressed": "rar",
        "application/x-7z-compressed": "7z",
        "application/gzip": "gz",
        "application/x-tar": "tar",
    
        // Audio
        "audio/mpeg": "mp3",
        "audio/wav": "wav",
        "audio/ogg": "ogg",
        "audio/aac": "aac",
        "audio/flac": "flac",
    
        // Video
        "video/mp4": "mp4",
        "video/webm": "webm",
        "video/ogg": "ogv",
        "video/x-msvideo": "avi",
        "video/x-matroska": "mkv",
    
        // Applications
        "application/json": "json",
        "application/javascript": "js",
        "application/xml": "xml",
        "application/octet-stream": "bin",
        "application/x-sh": "sh"
    };
    

    return mimeToExt[blob.type] || 'bin'; // Default to .bin if unknown
}
export   function isImageFile(filename: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', '.svg'];
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  }
