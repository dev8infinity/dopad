import { useRef } from "react";
import { ImageProps } from "./types";
import './index.css';
import CopyButton from "../CopyButton";

const Image = (props: ImageProps) => {
  const ref = useRef(null);
  return (
    <div className="card">
      <img className="card__img" id="image" ref={ref} width="100" src={props.url} alt="" />

      <CopyButton content={props.url} type="image" class="card__action"></CopyButton>
    </div>
  );
};

export default Image;