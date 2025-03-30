export type AttachmentType = 'file' | 'image' ;
export interface Attachment {
  key: string,
  type: AttachmentType,
  url?: string,
  // hash?: string,
}
export interface Content {
  key: string,
  text?: string,
  hash?: string,
}
export function isAttachmentFile(obj: object | undefined): boolean {
  return obj != undefined && ('type' in obj) && (obj.type == 'file') && ('url' in obj) && obj.url != undefined;
}
export function isContentImg(obj: object | undefined): boolean {
  return obj != undefined && ('type' in obj) && (obj.type == 'image') && ('url' in obj) && obj.url != undefined;
}
