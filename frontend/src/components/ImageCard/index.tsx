import { ImageCardProps } from "./types";
import '../common/css/card.css';

const ImageCard = (props: ImageCardProps) => {

  return (
    <div className="card" id={props.id}>
      <img className="card__img" 
        draggable="false" 
        id={props.id}
        src={props.url}
        alt="" />
    </div>
  );
};

export default ImageCard;