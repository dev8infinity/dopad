import { AttachmentType } from "../../types"

export type CopyButtonProps = {
    content?: string,
    onClick?: () => void,
    type: AttachmentType | "function",
    class?: string
}