import { useState, useEffect, useRef } from 'react'
import './App.css'
import ImageCard from './components/ImageCard'
import FileCard from './components/FileCard'
import CopyButton from './components/CopyButton';
import * as convert from './functions/convert';
import { v4 } from 'uuid';
import { Content, ContentType, isContentText, isContentImg, isContentFile } from './types';
import * as helpers from "./functions/helpers";

const defaultContent: Content[] = [
  {
    key: "1",
    type: 'text',
    text: 'JJJJJJ',
    hash: "d3aefcb4a74782727092ed69941b957fcb95f002",
  },
  {
    key: "2",
    type: 'image',
    url: '/1.jpg',
  },
  {
    key: "3",
    type: 'text',
    text: '12345',
    hash: "e8725db7648f38866a932387e695c9b199a8d638",
  },
  {
    key: "5",
    type: 'file',
    url: '/1.pdf',
  },
  {
    key: "6",
    type: 'text',
    text: '12345',
    hash: "e8725db7648f38866a932387e695c9b199a8d638",
  },
];
function App() {

  const [displayedContent, setDisplayedContent] = useState<Content[]>(defaultContent);
  const queueTextUpdate = useRef<{ key: string, concatString: string }[]>([]);
  const lastSelection = useRef<number>();
  const lastElementSelected = useRef<Node>();

  function updateTextItem(id: string, newText: string) {
    setDisplayedContent(c => c.map((item) => {
      if (item.key == id && isContentText(item)) {
        item.text = newText;
        item.hash = helpers.createSHA256Hash(newText);
      }
      return item;
    }))
  }
  function concatStringTextItem(id: string, concatStr: string) {
    setDisplayedContent(c => c.map((item) => {
      if (item.key == id && isContentText(item)) {
        item.text += concatStr;
        item.hash = helpers.createSHA256Hash(item.text as string);
      }
      return item;
    }))
  }

  function addItem(type: ContentType, urlOrText: string, atIndex?: number) {
    const newContent: Content[] = [{ key: v4(), type, url: type != 'text' ? urlOrText : undefined, text: type == 'text' ? urlOrText : undefined }];
    if (type != 'text') {
      newContent.push({ key: v4(), type: 'text', text: " " });
    }
    setDisplayedContent(c => {
      if (atIndex) {
        const newContentArray = [...c]; // Make a copy of the existing content array
        newContentArray.splice(atIndex, 0, newContent[0]); // Insert newContent at the given index
        return newContentArray;
      }
      return [...c, ...newContent];
    });
  }

  function deleteItens(keys: string[]) {
    setDisplayedContent(c => c.filter((item) => !keys.includes(item.key)));
  }

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {

    if (e.clipboardData.files && e.clipboardData.files.length > 0) {

      convert.retrieveFileFromClipboardAsBase64(e, function (base64: string | undefined, isImage: boolean) {
        if (base64) {
          addItem(isImage ? 'image' : 'file', base64)
        }
      });
      return;
    }
  }

  function handleInput(e: React.FormEvent<HTMLDivElement>) {

    const nodes = Array.from(e.currentTarget.children);

    displayedContent.forEach((content) => {
      const htmlNode = nodes.find(node => node.id == content.key);
      if (!htmlNode) {
        return;
      }
      if ('innerText' in htmlNode && isContentText(content) && helpers.createSHA256Hash(htmlNode.innerText as string) != content.hash) {
        updateTextItem(content.key, htmlNode.innerText as string);
        return;
      }
    })
  }

  function handleDeleteButtonWhenCaret(event: React.KeyboardEvent<HTMLDivElement>) {
    if (window.getSelection()?.type != "Caret" || !["Backspace", "Delete"].includes(event.key)) {
      return;
    }
    const toDelete: string[] = [];

    Array.from(event.currentTarget.children).forEach((node) => {
      if (!window.getSelection()?.containsNode(node, true)) {
        return;
      }
      const content = displayedContent.find((content) => content.key == node.id);
      if (!content) {
        console.log("error, content not found while deleting with caret", node);
        return;
      }
      if (!isContentText(content) || (content.text || "").trim() == "") {
        console.log("content is being deleted with caret, preventing default..., deleting from state", content);
        toDelete.push(node.id);
        event.preventDefault();
      }
    })
    deleteItens(toDelete);
  }


  function handleSelection() {

    const selection = window.getSelection();
    if (!selection || selection.type != "Range") {
      return;
    }
    const anchorNode = (selection.anchorNode?.nodeType == 1 ? selection.anchorNode : selection.anchorNode?.parentElement) as HTMLElement;
    const destinationNode = (selection.focusNode?.nodeType == 1 ? selection.focusNode : selection.focusNode?.parentElement) as HTMLElement;
    const indexA = displayedContent.findIndex(item => item.key === anchorNode.id);
    const indexD = displayedContent.findIndex(item => item.key === destinationNode.id);
    const selectedContents = helpers.getValuesBetween(displayedContent, indexA, indexD);
    const toRemove: Content[] = [];
    let contentA = selectedContents.shift();
    while (selectedContents.length && contentA && !isContentText(contentA)) {
      toRemove.push(contentA);
      contentA = selectedContents.shift();
    }

    let contentD = selectedContents.pop();
    while (selectedContents.length && contentD && !isContentText(contentD)) {
      toRemove.push(contentD);
      contentD = selectedContents.pop();
    }

    if (contentD && !isContentText(contentD)) {
      toRemove.push(contentD);
      contentD = undefined;
    }
    if (contentA && !isContentText(contentA)) {
      toRemove.push(contentA);
      contentA = undefined;
    }

    if (!contentA) {
      deleteItens(toRemove.map((content) => content.key));
      return;
    }

    toRemove.push(...selectedContents);
    //If anchor is before the destination of selection
    if (indexA < indexD && contentA && contentD) {
      const str = contentA.text as string;
      const newString = helpers.deleteSubstring(str, Math.min(selection.anchorOffset, str.length), Math.max(selection.anchorOffset, str.length));
      if (newString == "") {
        toRemove.push(contentA);
      }
      const str2 = contentD.text as string;
      const newString2 = helpers.deleteSubstring(str2, Math.min(0, selection.focusOffset), Math.max(0, selection.focusOffset));
      if (newString2 == "") {
        toRemove.push(contentD);
      }
      if (newString != "" && newString2 != "") {
        queueTextUpdate.current.push({ key: contentA.key, concatString: newString2 })
        toRemove.push(contentD);
      }
    }
    //If anchor is after the destination of selection
    if (indexA > indexD && contentA && contentD) {
      const str = contentA.text as string;
      const newString = helpers.deleteSubstring(str, Math.min(0, selection.anchorOffset), Math.max(0, selection.anchorOffset));
      console.log("newString", newString);
      if (newString == "") {
        toRemove.push(contentA);
      }
      const str2 = contentD.text as string;
      const newString2 = helpers.deleteSubstring(str2, Math.min(selection.focusOffset, str2.length), Math.max(selection.focusOffset, str2.length));

      if (newString2 == "") {
        toRemove.push(contentD);
      }

      if (newString != "" && newString2 != "") {
        queueTextUpdate.current.push({ key: contentD.key, concatString: newString })
        toRemove.push(contentA);
      }
    }
    console.log("toBEEEEERemoved in handleSelection: ", toRemove);
    deleteItens(toRemove.map((content) => content.key));


  }
  useEffect(() => setSelectionDOM(), [displayedContent]);
  function setSelectionDOM() {
    console.log("displayedContent", displayedContent);
    if (!lastElementSelected.current || !lastSelection.current) {
      return;
    }
    console.log("setting selection to element, position: ", lastElementSelected.current, lastSelection.current);
    const range = document.createRange();
    range.setStart(lastElementSelected.current, lastSelection.current);
    range.setEnd(lastElementSelected.current, lastSelection.current);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    lastElementSelected.current = lastSelection.current = undefined;
  }
  return (
    <>
      <button onClick={() => setDisplayedContent([{ key: "3", type: "text", text: "aaa" }])}>clear</button>
      <div id='rootie' contentEditable={"plaintext-only"} suppressContentEditableWarning={true}
        onKeyDown={handleDeleteButtonWhenCaret}
        onPaste={handlePaste}
        onCut={handleSelection}
        onBeforeInput={(e: React.CompositionEvent<HTMLInputElement>) => {
          const selection = window.getSelection();
          const anchorNode = (selection?.anchorNode?.nodeType == 1 ? selection?.anchorNode : selection?.anchorNode?.parentElement) as HTMLElement;
          const focusedItem = displayedContent.find((content) => content.key == anchorNode.id);

          //if user tries to type in a non text item, we add the text to the next item
          //BUG: the image is being deleted
          if (selection?.type == "Caret" &&
            ((focusedItem && !isContentText(focusedItem)) || anchorNode.id == "rootie")) {
            e.preventDefault();
            console.log("user tries to type in a non-text item", focusedItem);
            console.log("anchorNode", anchorNode);

            if (!focusedItem) {
              console.log("item was not found when user tries to type in a non-text item");
              return;
            }

            const currentIndex = displayedContent.findIndex(content => content.key === focusedItem.key);
            const data = e.data;

            if (currentIndex > -1 && displayedContent.length >= currentIndex + 1 && isContentText(displayedContent[currentIndex + 1])) {
              const nextItem = displayedContent[currentIndex + 1];
              console.log("there is a next item to put the text in", nextItem);
              updateTextItem(nextItem.key, data + nextItem.text);
              return;
            }
            console.log("there is NOT a next text item to put the text in. Creating...", focusedItem);
            addItem('text', data, currentIndex + 1);
            return;
          }

          handleSelection();
        }}
        onInput={(e) => {

          handleInput(e);

          let item = queueTextUpdate.current.pop();
          while (item) {
            console.log("updating: ", item);
            concatStringTextItem(item.key, item.concatString);
            item = queueTextUpdate.current.pop();
          }

          lastSelection.current = window.getSelection()?.anchorOffset;
          lastElementSelected.current = window.getSelection()?.focusNode as Node;
        }}

      >
        {
          displayedContent.map((item, index) => {
            if (isContentText(item)) {
              return <div id={item.key} key={item.key} className={"itemText" + (index == displayedContent.length - 1 ? "lastChild" : "")}>{item.text}</div>
            }
            else if (isContentImg(item)) {
              return <ImageCard id={item.key} onDelete={() => deleteItens([item.key])} key={item.key} url={item.url as string} />
            }
            else if (isContentFile(item)) {
              return <FileCard id={item.key} onDelete={() => deleteItens([item.key])} key={item.key} url={item.url as string} />
            }
          })
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
