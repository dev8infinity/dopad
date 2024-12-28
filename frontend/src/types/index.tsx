export type ContentType = 'file' | 'image' | 'text';
export interface Content {
  key: string,
  type: ContentType,
  url?: string,
  text?: string,
  hash?: string,
}
export function isContentFile(obj: object | undefined): boolean {
  return obj != undefined && ('type' in obj) && (obj.type == 'file') && ('url' in obj) && obj.url != undefined;
}
export function isContentImg(obj: object | undefined): boolean {
  return obj != undefined && ('type' in obj) && (obj.type == 'image') && ('url' in obj) && obj.url != undefined;
}
export function isContentText(obj: object | undefined): boolean{
  return obj != undefined && ('type' in obj) && (obj.type == 'text') && ('text' in obj) && obj.text != undefined;
}