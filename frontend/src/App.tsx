import { useState, useEffect, useRef } from 'react';
import './App.css';
import CopyButton from './components/CopyButton';
import { Attachment, Content } from './types';
import Sidebar from './components/Sidebar';
import React from 'react';

const defaultContent: Content = {
  key: "1",
  text: 'asdasdsadsad',
  hash: "d3aefcb4a74782727092ed69941b957fcb95f002",
};

const files: Attachment[] = [
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
  const [displayedContent, setDisplayedContent] = useState<Content>(defaultContent);
  const contentRef = useRef<HTMLDivElement>(null);
  const isTimeoutUpdate = useRef(false);

  useEffect(() => {
    const handleInput = () => {
      if (contentRef.current && !isTimeoutUpdate.current) {
        setDisplayedContent((prev) => ({ ...prev, text: contentRef.current!.innerText }));
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
    const timeout = setTimeout(() => {
      isTimeoutUpdate.current = true; // Mark as timeout update
      setDisplayedContent((prev) => ({
        ...prev,
        text: "123",
      }));
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <Sidebar content={files} />
      <div
        id='rootie'
        contentEditable={"plaintext-only"}
        suppressContentEditableWarning={true}
        ref={contentRef}
        className="itemText"
      >
        {defaultContent.text}
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
