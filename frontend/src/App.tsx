import { useState, useEffect, useRef } from 'react'
import './App.css'
import ImageCard from './components/ImageCard'
import FileCard from './components/FileCard'
import CopyButton from './components/CopyButton';
import * as convert from './functions/convert';
import { v4 } from 'uuid';
import { Content, ContentType, isContentText, isContentImg, isContentFile } from './types';
import * as helpers from "./functions/helpers";
import Sidebar from './components/Sidebar';

const defaultContent: Content[] = [
  {
    key: "1",
    type: 'text',
    text: 'JJJJJJ',
    hash: "d3aefcb4a74782727092ed69941b957fcb95f002",
  },

  {
    key: "3",
    type: 'text',
    text: '12345',
    hash: "e8725db7648f38866a932387e695c9b199a8d638",
  },
  
  {
    key: "6",
    type: 'text',
    text: '12345',
    hash: "e8725db7648f38866a932387e695c9b199a8d638",
  },
];
const files: Content[] = [
  {
    key: "5",
    type: 'file',
    url: '/1.pdf',
  },
  {
    key: "2",
    type: 'image',
    url: '/1.jpg',
  },
];
function App() {

  const [displayedContent, setDisplayedContent] = useState<Content[]>(defaultContent);
  

  return (
    <>
    <Sidebar content={files}/>
      <div id='rootie' contentEditable={"plaintext-only"} suppressContentEditableWarning={true}
        // onKeyDown={handleDeleteButtonWhenCaret}
        // onPaste={handlePaste}
        // onCut={handleSelection}
        // onBeforeInput={onBeforeInput}
        // onInput={onInput}

      >
        {
          displayedContent.map((item, index) => 
            <div id={item.key} key={item.key} className={"itemText" + (index == displayedContent.length - 1 ? "lastChild" : "")}>{item.text}</div>
          )
        }
      </div>
      <CopyButton
        type="function"
        onClick={() => {
          const selection = window.getSelection();
          const container = document.querySelector('#rootie');
          if(!selection || !container){
            return;
          }
          if (selection.rangeCount > 0) {
            selection.removeAllRanges();
          }
          
          const range = document.createRange();
          range.selectNode(container);
          selection.addRange(range);
          document.execCommand("copy");
          selection.removeAllRanges();
          return;
        }} />
  
    </>
  )

}

export default App
