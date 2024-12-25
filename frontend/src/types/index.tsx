export type ContentType = 'file' | 'image' | 'text';
export interface Content {
  key: string,
  type: ContentType,
  url?: string,
  text?: string,
}
export function isContentFile(obj: object) {
  return 'type' in obj && obj.type == 'file' && 'url' in obj && obj.url;
}
export function isContentImg(obj: object) {
  return 'type' in obj && obj.type == 'image' && 'url' in obj && obj.url;
}
export function isContentText(obj: object) {
  return 'type' in obj && obj.type == 'text' && 'text' in obj && obj.text;
}