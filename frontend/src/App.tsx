import { useState } from 'react'
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

  const [displayedContent, setDisplayedContent] = useState<Content[]>(JSON.parse(JSON.stringify(defaultContent)));
  const [trackedContent, setTrackedContentBD] = useState<Content[]>(defaultContent);


  function updateItemText(id: string, newValue: string) {
    setTrackedContentBD(c => c.map((item) => {
      if (item.key == id && isContentText(item)) {
        item.text = newValue;
        item.hash = helpers.createSHA256Hash(newValue);
      }
      return item;
    }))
  }

  function addFileItemToDisplay(type: ContentType, newValue: string) {
    const newContent: Content[] = [{ key: v4(), type, url: newValue } as Content, { key: v4(), type: 'text', text: " " }];
    setTrackedContentBD(c => [...c, ...newContent]);
    setDisplayedContent(c => [...c, ...newContent]);
  }

  function deleteItens(keys: string[]) {
    setTrackedContentBD(c => c.filter((item) => !keys.includes(item.key)));
  }

  function deleteItensFromDisplay(keys: string[]) {
    setTrackedContentBD(c => c.filter((item) => !keys.includes(item.key)));
    setDisplayedContent(c => c.filter((item) => !keys.includes(item.key)));
  }

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();

    if (e.clipboardData.files && e.clipboardData.files.length > 0) {

      convert.retrieveFileFromClipboardAsBase64(e, function (base64: string | undefined, isImage: boolean) {
        if (base64) {
          addFileItemToDisplay(isImage ? 'image' : 'file', base64)
        }
      });
      return;
    }
    //TODO
    // console.log(e.clipboardData.getData('Text'))
  }

  function handleInput(e: React.FormEvent<HTMLDivElement>) {
    const toDelete: string[] = [];
    const nodes = Array.from(e.currentTarget.children);

    trackedContent.forEach((content) => {
      const htmlNode = nodes.find(node => node.id == content.key);
      if (!htmlNode) {
        toDelete.push(content.key);
        return;
      }
      if ((isContentImg(content) || isContentFile(content)) && htmlNode.querySelector('img') == null) {
        toDelete.push(content.key);
        return;
      }
      if ('innerText' in htmlNode && isContentText(content) && helpers.createSHA256Hash(htmlNode.innerText as string) != content.hash) {
        updateItemText(content.key, htmlNode.innerText as string);
        return;
      }
    })
    deleteItens(toDelete);
  }

  function handleDeleteButton(event: React.ClipboardEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) {
    const toDelete: string[] = [];

    Array.from(event.currentTarget.children).forEach((node) => {
      if (!window.getSelection()?.containsNode(node, true)) {
        return;
      }
      const content = trackedContent.find((content) => content.key == node.id)
      if (content && !isContentText(content)) {
        toDelete.push(node.id);
      }
    })
    deleteItensFromDisplay(toDelete);
  }

  function handleSelection() {

    const selection = window.getSelection();
    if (selection?.type == "Range") {

      const finalContent: Content[] = JSON.parse(JSON.stringify(trackedContent))
      const anchorNode = (selection.anchorNode?.nodeType == 1 ? selection.anchorNode : selection.anchorNode?.parentElement) as HTMLElement;
      const destinationNode = (selection.focusNode?.nodeType == 1 ? selection.focusNode : selection.focusNode?.parentElement) as HTMLElement;
      const indexA = trackedContent.findIndex(item => item.key === anchorNode.id);
      const indexD = trackedContent.findIndex(item => item.key === destinationNode.id);
      const selectedContents = helpers.getValuesBetween(trackedContent, indexA, indexD);
      const toRemove: Content[] = [];

      let contentA = selectedContents.shift();
      while (selectedContents.length && contentA && !isContentText(contentA)) {
        toRemove.push(contentA);
        contentA = selectedContents.shift();
      }


      let contentD = selectedContents.pop();
      while (selectedContents.length && contentD && !isContentText(contentD)) {
        toRemove.push(contentD);
        contentA = selectedContents.shift();
      }

      if (contentD && !isContentText(contentD)) {
        toRemove.push(contentD);
        contentD = undefined;
      }
      if (!contentA) {
        deleteItens(toRemove.map((content) => content.key));
        return;
      }
      if (indexA == indexD || !contentD) {
        if (!isContentText(contentA)) {
          toRemove.push(contentA);
        } else {
          const str = contentA.text as string;
          updateFinalContentItemText(finalContent, contentA.key,
            helpers.deleteSubstring(str, Math.min(selection.anchorOffset, selection.focusOffset), Math.max(selection.anchorOffset, selection.focusOffset))
          );
        }
      }
      toRemove.push(...selectedContents);


      if (indexA < indexD && contentA && contentD) {
        const str = contentA.text as string;
        const newString = helpers.deleteSubstring(str, Math.min(selection.anchorOffset, str.length), Math.max(selection.anchorOffset, str.length));
        if(newString != "") {
          updateFinalContentItemText(finalContent, contentA.key, newString);
        } else {
          toRemove.push(contentA);
        }
        const str2 = contentD.text as string;
        const newString2 = helpers.deleteSubstring(str2, Math.min(0, selection.focusOffset), Math.max(0, selection.focusOffset));
        if(newString2 != "") {
          updateFinalContentItemText(finalContent, contentD.key, newString2);
        } else {
          toRemove.push(contentD);
        }
        if (newString != "" && newString2 != "") {
          updateFinalContentItemText(finalContent, contentA.key, newString + newString2)
          toRemove.push(contentD);
        }
      }
      if (indexA > indexD && contentA && contentD) {
        const str = contentA.text as string;
        const newString = helpers.deleteSubstring(str, Math.min(0, selection.anchorOffset), Math.max(0, selection.anchorOffset));
        if(newString != "") {
          updateFinalContentItemText(finalContent, contentA.key, newString);
        } else {
          toRemove.push(contentA);
        }

        const str2 = contentD.text as string;
        const newString2 = helpers.deleteSubstring(str2, Math.min(selection.focusOffset, str2.length), Math.max(selection.focusOffset, str2.length));
        if(newString2 != "") {
          updateFinalContentItemText(finalContent, contentD.key, newString2);
        } else {
          toRemove.push(contentD);
        }

        if (newString != "" && newString2 != "") {
          const t = newString2 + newString;

          updateFinalContentItemText(finalContent, contentD.key, t)
          toRemove.push(contentA);
        }
      }
      setTrackedContentBD(updateFinalContentItemDelete(finalContent, toRemove.map((content) => content.key)));
      deleteItens(toRemove.map((content) => content.key));
    }
    function updateFinalContentItemText(finalContent: Content[], key: string, newValue: string) {
      finalContent.forEach((content) => {
        if (content.key == key) {
          content.text = newValue;
        }
      })
    }

    function updateFinalContentItemDelete(finalContent: Content[], keys: string[]) {
      const ret: Content[] = [];
      finalContent.forEach((content) => {
        if (!keys.includes(content.key)) {
          ret.push(content)
        }
      })
      return ret
    }
  }

  return (
    <>
      <div id='rootie' contentEditable={"plaintext-only"} suppressContentEditableWarning={true}
        onKeyDown={(e) => {
          if (e.key === "Backspace" || e.key === "Delete") {
            handleDeleteButton(e);
            return;
          }
          handleSelection();
        }}
        onPaste={handlePaste}
        onInput={handleInput}
        onCut={handleDeleteButton}

      >
        {
          displayedContent.map((item, index) => {
            if (isContentText(item)) {
              return <div id={item.key} key={item.key} className={"itemText" + (index == displayedContent.length - 1 ? "lastChild" : "")}>{item.text}</div>
            }
            else if (isContentImg(item)) {
              return <ImageCard id={item.key} onDelete={() => deleteItensFromDisplay([item.key])} key={item.key} url={item.url as string} />
            }
            else if (isContentFile(item)) {
              return <FileCard id={item.key} onDelete={() => deleteItensFromDisplay([item.key])} key={item.key} url={item.url as string} />
            }
          })
        }
      </div>
      <CopyButton type='text'
        content={trackedContent.reduce((previous, current) => {
          if (isContentText(current)) {
            previous.text = previous.text + '\n' + current.text;
          }
          return previous;
        }, { text: "" } as Content).text || ""
        } />

    </>
  )

}

export default App
