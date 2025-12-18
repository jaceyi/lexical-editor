import React, { useCallback, useEffect } from 'react';
import { CustomePlugin } from './CustomePlugin';
import { CLEAR_EDITOR_COMMAND } from 'lexical';

import '../../src/index.scss';
import Editor, { useHTMLHandle } from '../../src';

const App = () => {
  const [{ value, onChange }, editorHandleProps, editorRef] = useHTMLHandle({
    initialValue: 'Initial Value'
  });

  useEffect(() => {
    setTimeout(() => {
      onChange(
        'Loaded Value <br/> two lines'
      );
    }, 2000);
  }, []);

  const handleUploadFile = useCallback((file: File) => {
    return new Promise<{ url: string; name: string }>(resolve => {
      setTimeout(() => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
          resolve({
            url: reader.result as string,
            name: file.name
          });
        };
      }, 0);
    });
  }, []);

  return (
    <div>
      <Editor
        namespace="Editor"
        config={{
          onUploadFile: handleUploadFile,
          mentions: ['Jace', 'Liliana', 'Chandra', 'Gideon', 'Nissa', 'Ajani'],
          keywords: ['editor']
        }}
        {...editorHandleProps}
      >
        <CustomePlugin />
      </Editor>
      <div style={{ margin: '10px 0' }}>
        <button
          onClick={() => {
            onChange('');
            editorRef.current?.editor?.dispatchCommand(
              CLEAR_EDITOR_COMMAND,
              undefined
            );
          }}
        >
          清空内容并清空历史记录
        </button>
      </div>
      <Editor
        namespace="ReadEditor"
        isEditable={false}
        value={value}
        config={{
          keywords: ['editor']
        }}
      />
    </div>
  );
};

export default App;
