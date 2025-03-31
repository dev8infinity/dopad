import { useState, useEffect, useRef } from 'react';
import './App.css';
import CopyButton from './components/CopyButton';
import { Attachment, Content } from './types';
import Sidebar from './components/Sidebar';
import * as convert from './functions/convert';
import * as api from './hooks';
import { isImageFile,createHash, sanitizeInput } from './functions/helpers';

let defaultContent: Content = {
  text: '',
};

let att: Attachment[] = [

];
const ENDPOINT = window.location.pathname.replace('/', '');

const fetchDetails = async () => {
  try {
    const details = await api.getEndpointDetails(ENDPOINT);
    if (details) {
      const attachments: Attachment[] = details.attachments.map((file: any) => ({
        key: file.id,
        type: isImageFile(file.filePath) ? 'image' : 'file',
        url: file.filePath,
      }));
      att = attachments;
      defaultContent ={
        text: details.text,
        hash: details.hash,
      }
    }
  } catch (error) {
    console.error("Error fetching endpoint details:", error);
  }
};

await fetchDetails();

function App() {
  const [displayedContent, setDisplayedContent] = useState<Content>(defaultContent);
  const [files, setFiles] = useState<Attachment[]>(att);
  const contentRef = useRef<HTMLDivElement>(null);
  const isTimeoutUpdate = useRef(false);

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {

    if (e.clipboardData.files && e.clipboardData.files.length > 0) {

      convert.retrieveFileFromClipboard(e, function (b64, isImage: boolean, blob: Blob | undefined) {
        if (blob) {
          api.uploadFile(ENDPOINT, blob);
        }
      });
      return;
    }
  }

  
  function deleteFile(key: string) {
    setFiles((c: Attachment[]) => c.filter((item) => item.key != key));
    api.deleteFile(key);
  }

  useEffect(() => {
    const handleInput = () => {
      if (contentRef.current && !isTimeoutUpdate.current) {
        setDisplayedContent((prev) => ({ ...prev, text: contentRef.current!.innerText }));
        api.updateContent( ENDPOINT, contentRef.current!.innerText);
      }
    };

    const divElement = contentRef.current;
    if (divElement) {
      divElement.addEventListener('input', handleInput);
    }

    return () => {
      if (divElement) {
        divElement.removeEventListener('input', handleInput);
      }
    };
  }, []);

  useEffect(() => {
    if (!contentRef.current || !isTimeoutUpdate.current) {
      return;
    }
    isTimeoutUpdate.current = false; // Reset flag after updating
    contentRef.current.innerText = displayedContent.text as string;
  }, [displayedContent]);

  useEffect(() => {
  const interval = setInterval(async () => {
    const hash = createHash(displayedContent.text as string);
    const details = await api.getEndpointDetails(ENDPOINT);

    const updatedAttachments: Attachment[] = details.attachments.map((file: any) => ({
      key: file.id,
      type: isImageFile(file.filePath) ? 'image' : 'file',
      url: file.filePath,
    }));

    if (details.hash !== hash ) {
      isTimeoutUpdate.current = true;
      console.log("text updated", hash, details.hash)
      setDisplayedContent({ text: details.text });
    }
    if(JSON.stringify(updatedAttachments) !== JSON.stringify(files)){
      setFiles(updatedAttachments);
      console.log("files updated")
    }
    }, 1000);

    return () => clearInterval(interval);
  }, [displayedContent, files]);
  

  return (
    <>
      <Sidebar OnDeleteItem={(itemId: string) => deleteFile(itemId)} content={files} />
      <div
        id='rootie'
        contentEditable={"plaintext-only"}
        suppressContentEditableWarning={true}
        ref={contentRef}
        className="itemText"
        onPaste={handlePaste}
      >
        {sanitizeInput(defaultContent.text as string)}
      </div>
      <CopyButton
        type="function"
        onClick={() => {
          navigator.clipboard.writeText(displayedContent.text || "");
        }}
      />
    </>
  );
}

export default App;