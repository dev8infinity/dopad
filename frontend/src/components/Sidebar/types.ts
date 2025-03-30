import { Attachment } from "../../types"
export type SidebarProps = {
    content: Attachment[],
    OnDeleteItem: (id: string) => void
}