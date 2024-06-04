import React, { useCallback } from 'react';
import { CustomePlugin } from './CustomePlugin';

// import 'lexical-editor/style.css';
// import Editor, { useHTMLHandle } from 'lexical-editor';

import '../../style.css';
import Editor, { useHTMLHandle } from '../../src';

const App = () => {
  const [{ value, onChange }, editorHandleProps] = useHTMLHandle({
    initialValue:
      '<p dir="ltr"><span style="white-space: pre-wrap;">Hello World! </span><span data-lexical-mention="true" data-lexical-mention-trigger="@" lexical-mention-value="Jace">@Jace</span><span style="white-space: pre-wrap;"> </span><span class="theme__textKeyword" style="white-space: pre-wrap;">editor</span></p><p><img src="https://lexical.dev/img/favicon.ico"></p>'
  });

  const handleUploadFile = useCallback(file => {
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
        namespace="ReasonEditor"
        config={{
          onUploadFile: handleUploadFile,
          mentions: ['Jace', 'Liliana', 'Chandra', 'Gideon', 'Nissa', 'Ajani'],
          keywords: ['editor']
        }}
        plugins={[
          {
            Component: CustomePlugin,
            key: 'CustomePlugin',
            props: { type: 'inline' }
          }
        ]}
        {...editorHandleProps}
      />
      <button
        onClick={() => {
          onChange('你好 世界！');
        }}
      >
        Set HTML
      </button>
    </div>
  );
};

export default App;
