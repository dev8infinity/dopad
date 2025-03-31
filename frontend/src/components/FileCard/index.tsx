import { FileProps } from "./types";
import '../common/css/card.css';

const FileCard = (props: FileProps) => {

  return (
    <div className="card" id={props.id} 
    >
      <img className="card__img"
        draggable="false"
        id={props.id}
        src={import.meta.env.VITE_FRONT_URL + "/generic.png"}
        alt="image of generic file" />
    </div>
  );
};

export default FileCard;