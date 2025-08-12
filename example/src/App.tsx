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
      onChange('Loaded Value <br/> two lines');
    }, 2000);
  }, []);

  const handleUploadFile = useCallback((file: File) => {
    if (file.size > 1024 * 1024 * 20) {
      console.log('文件过大，最大可上传20M的文件。');
      return Promise.reject();
    }
    if (encodeURI(file.name).length >= 150) {
      console.log('文件名过长！');
      return Promise.reject();
    }
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
        autoFocus={true}
        config={{
          onUploadFile: handleUploadFile,
          mentions: ['Jace', 'Liliana', 'Chandra', 'Gideon', 'Nissa', 'Ajani'],
          keywords: ['editor']
        }}
        {...editorHandleProps}
      >
        <CustomePlugin />
      </Editor>
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
