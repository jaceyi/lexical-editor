import React from 'react';
import Editor, { useHTMLHandle } from '../../src/index';
import type { UploadFile } from '../../src/types';

const onUploadFile: UploadFile = file => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ url: reader.result as string, name: file.name });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
const config = {
  onUploadFile,
  keywords: ['javascript', 'react'],
  mentions: ['Jace', 'Liliana', 'Chandra', 'Gideon', 'Nissa', 'Ajani']
};

const App = () => {
  const [{ value: htmlOutput }, htmlEditorProps] = useHTMLHandle();
  console.log(htmlOutput);

  return (
    <div className="container">
      <h2>Dev Example</h2>
      <Editor
        {...htmlEditorProps}
        // locale="en-US"
        namespace="edit-editor"
        placeholder="开始输入..."
        config={config}
      />
      <Editor namespace="read-editor" isEditable={false} config={config} value={htmlOutput} />
    </div>
  );
};

export default App;
