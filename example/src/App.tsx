import React, { useRef } from 'react';
import Editor, { EditorRef } from '../../src/index';

const App = () => {
  const editorRef = useRef<EditorRef>(null);

  return (
    <div className="container">
      <h2>Dev Example</h2>
      <Editor namespace="dev-editor" ref={editorRef} mode="html" placeholder="开始输入..." />
    </div>
  );
};

export default App;
