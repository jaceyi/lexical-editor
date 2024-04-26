# Lexical-Editor

> 基于 [lexical](https://lexical.dev/) 开发的富文本编辑器

```jsx
const App = () => {
  const [editor, setEditor] = useState(null);
  const [readValue, setReadValue] = useState('');

  const handleFileUpload = useCallback(file => {
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
          keywords: ['Hean']
        }}
      />
      <button
        onClick={() =>
          editor.update(async () => {
            const html = $generateHtmlFromNodes(editor);
            console.log(html);
          })
        }
      >
        Export HTML
      </button>
    </div>
  );
};
```
