import { useCallback } from 'react';
import { CustomePlugin } from './CustomePlugin';

import '../../dist/style.css';
import Editor, { useHTMLHandle } from '../../dist';

const App = () => {
  const [{ value, onChange }, editorHandleProps] = useHTMLHandle({
    initialValue: 'Hello World!'
  });

  const handleFileUpload = useCallback(file => {
    if (file.size > 1024 * 1024 * 20) {
      console.log('文件过大，最大可上传20M的文件。');
      return Promise.reject();
    }
    if (encodeURI(file.name).length >= 150) {
      console.log('文件名过长！');
      return Promise.reject();
    }
    return new Promise(resolve => {
      setTimeout(() => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
          resolve({
            url: reader.result,
            name: file.name
          });
        };
      }, 0);
    });
  }, []);

  console.log(value);

  return (
    <div>
      <Editor
        namespace="ReasonEditor"
        config={{
          onFileUpload: handleFileUpload,
          mentions: ['Jace'],
          keywords: ['Hean']
        }}
        plugins={[<CustomePlugin key="custom-plugin" type="inline" />]}
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
