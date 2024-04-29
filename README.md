# Lexical-Editor

> 基于 [lexical](https://lexical.dev/) 开发的富文本编辑器

## 使用方法

项目依赖 `react` `react-dom` `lexical` `@lexical/react` `@lexical/utils`

### 示例

```jsx
import Editor, { useHTMLHandle } from 'lexical-editor';

const App = () => {
  const [{ value, onChange }, editorHandleProps] = useHTMLHandle({
    initialValue: 'Hello World!'
  });

  const handleFileUpload = useCallback(file => {
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
