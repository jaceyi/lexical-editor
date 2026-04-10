# Lexical Editor

[![NPM version][npm-image]][npm-url] [![Github @jaceyi/lexical-editor][github-image]][github-url]

[npm-image]: https://badgen.net/npm/v/@jaceyi/lexical-editor?style=flat-square
[npm-url]: https://npmjs.org/package/@jaceyi/lexical-editor
[github-image]: https://badgen.net/badge/icon/lexical-editor?icon=github&label=Github&style=flat-square
[github-url]: https://github.com/jaceyi/lexical-editor

基于 [Lexical](https://lexical.dev/) 的 React 富文本编辑器，可快速上手。

- 基础富文本能力：粗体、斜体、下划线、标题、引用、列表
- 常用样式能力：颜色、字号、字体、对齐
- 扩展能力：链接、图片/文件上传、@提及、关键词高亮
- 双数据模式：`html` 字符串与 `json` 结构化数据

## Docs

[Documentation pages](https://lexical-editor-doc.web.app)

## Install

```bash
npm install @jaceyi/lexical-editor
# or
yarn add @jaceyi/lexical-editor
```

## Example

```tsx
import Editor, { useHTMLHandle } from '@jaceyi/lexical-editor';
import '@jaceyi/lexical-editor/style.css';

const App = () => {
  const [{ value }, editorProps] = useHTMLHandle({
    initialValue: '<p>Hello Lexical Editor</p>',
  });

  return (
    <>
      <Editor namespace="basic-demo" {...editorProps} />
      <pre>{value}</pre>
    </>
  );
};

export default App;
```

> `JSON` 模式可使用 `useJSONHandle`，并将 `mode` 设置为 `json`。

## License

MIT
