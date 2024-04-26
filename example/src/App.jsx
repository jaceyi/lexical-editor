import { useCallback, useMemo, useState } from 'react';

import '../../dist/style.css';
import Editor from '../../dist';

const App = () => {
  const [html, setHtml] = useState('');

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

  return (
    <div>
      {useMemo(
        () => (
          <Editor
            namespace="ReasonEditor"
            initialValue={html}
            onChangeHtml={setHtml}
            config={{
              onFileUpload: handleFileUpload,
              mentions: ['Jace'],
              keywords: ['Hean']
            }}
          />
        ),
        []
      )}
      <button onClick={() => console.log(html)}>Export</button>
    </div>
  );
};

export default App;
