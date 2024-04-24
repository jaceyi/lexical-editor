import { useCallback, useState } from 'react';
import Editor from './components/Editor';
import { Button } from 'antd';
import { $generateHtmlFromNodes } from '@lexical/html';
import { message } from 'antd';

const App = () => {
  const [editor, setEditor] = useState(null);
  const [readValue, setReadValue] = useState('');

  const handleFileUpload = useCallback(file => {
    if (file.size > 1024 * 1024 * 20) {
      message.warning('文件过大，最大可上传20M的文件。');
      return Promise.reject();
    }
    if (encodeURI(file.name).length >= 150) {
      message.warning('文件名过长！');
      return Promise.reject();
    }
    return new Promise(resolve => {
      setTimeout(() => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
          resolve({
            url: reader.result,
            name: file.name,
            type: file.type
          });
        };
      }, 0);
    });
  }, []);

  return (
    <div>
      <Editor
        namespace="ReasonEditor"
        value={readValue}
        onChange={setEditor}
        config={{
          onFileUpload: handleFileUpload,
          mentions: ['Jace'],
          keywords: ['@', '#']
        }}
      />
      <Button
        onClick={() =>
          editor.update(async () => {
            const html = $generateHtmlFromNodes(editor);
            console.log(html);
          })
        }
      >
        Export
      </Button>
    </div>
  );
};

export default App;
