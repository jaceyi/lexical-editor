# Lexical-Editor

> 基于 [lexical](https://lexical.dev/) 开发的富文本编辑器，注意：该项目禁支持可允许 ES6+ 浏览器。

## 使用方法

项目依赖 `react` `react-dom`

### 示例

```jsx
import 'lexical-editor/style.css';
import Editor, { useHTMLHandle } from 'lexical-editor';

const App = () => {
  const [{ value, onChange }, editorHandleProps] = useHTMLHandle({
    initialValue: 'Hello World!'
  });

  const handleUploadFile = useCallback(file => {
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
          onUploadFile: handleUploadFile,
          mentions: ['Jace', 'Liliana', 'Chandra', 'Gideon', 'Nissa', 'Ajani'],
          keywords: ['editor']
        }}
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
```
