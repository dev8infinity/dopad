import * as clipboard from "../../functions/clipboard";
import { CopyButtonProps } from "./types";
import "../common/css/button.css";

export default function CopyButton(props: CopyButtonProps) {
    return (
        <span className={props.class || "defaultCopyButton"} onClick={() => {
            if(props.onClick){
                props.onClick();
                return;
            }
            if(!props.content){
                return;
            }
            switch (props.type) {
                case "text":
                    clipboard.copyTextToClipboard(props.content);
                    break;
                case "image":
                    clipboard.copyImg(props.content);
                    break;
                default:
                    break;
            }
        }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-copy" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z" />
            </svg>
        </span>
    );
} 
