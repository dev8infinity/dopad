import { useState } from "react";
import "./index.css";
import ImageCard from "../ImageCard";
import { SidebarProps } from "./types";
import { isContentImg, isAttachmentFile } from "../../types";
import FileCard from "../FileCard";
import * as clipboard from "../../functions/clipboard";
import DownloadButton from "../DownloadButton";
import DeleteButton from "../DeleteButton";
import CopyButton from "../CopyButton";

const Sidebar = (props: SidebarProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const { content } = props;


  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        ☰
      </button>
      <nav>
        <h4>Arquivos</h4>
        <ul>
          {
            content.map((item) => {
              return (<li className="image-card-container">
                {
                  isContentImg(item) ? (
                    <ImageCard
                      id={item.key}
                      key={item.key}
                      url={item.url as string}
                    />
                  ) : isAttachmentFile(item) ? (
                    <FileCard
                      id={item.key}
                      key={item.key}
                      url={item.url as string}
                    />
                  ) : <></>
                }
                <div className="button-group">
                 <DeleteButton itemKey={item.key} onDelete={props.OnDeleteItem}/>
                  <button 
                  onClick={() => clipboard.copyTextToClipboard(import.meta.env.VITE_ATTACHMENTS_URL + (item.url as string))}
                    className="action-btn"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-link-45deg" viewBox="0 0 16 16">
                    <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z" />
                    <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z" />
                  </svg>
                  
                  </button>
                  {
                    isContentImg(item) ? (
                      <CopyButton class={"action-btn"} type="image" content={item.url as string}/>
                    ) : isAttachmentFile(item) ? (
                      <DownloadButton url={item.url as string}/>
                    ) : <></>
                  }
                </div>
              </li>
              )
            })
          }

        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
