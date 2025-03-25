import { ContentType } from "../../types"

export type CopyButtonProps = {
    content?: string,
    onClick?: () => void,
    type: ContentType | "function",
    class?: string
}