import { ImageProps } from "./types";
import '../common/css/card.css';
import DownloadButton from "../DownloadButton";

const FileCard = (props: ImageProps) => {
 
  return (
    <div className="card">
      <img className="card__img" id="image" 
      src="/generic.png" 
      alt="image of generic file" />

      <DownloadButton url={props.url} class="card__action" />
    </div>
  );
};

export default FileCard;