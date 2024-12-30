import { FileProps } from "./types";
import '../common/css/card.css';
import DownloadButton from "../DownloadButton";
import DeleteButton from "../DeleteButton";

const FileCard = (props: FileProps) => {

  return (
    <div className="card" id={props.id} 
    >
      <DeleteButton class="card__close" onDelete={() => props.onDelete()} />

      <img className="card__img"
        draggable="false"
        id={props.id}
        src="/generic.png"
        alt="image of generic file" />

      <DownloadButton url={props.url} class="card__action" />
    </div>
  );
};

export default FileCard;