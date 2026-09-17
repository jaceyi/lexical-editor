# Lexical Editor

[![NPM version][npm-image]][npm-url] [![Github @jaceyi/lexical-editor][github-image]][github-url]

[npm-image]: https://badgen.net/npm/v/@jaceyi/lexical-editor?style=flat-square
[npm-url]: https://npmjs.org/package/@jaceyi/lexical-editor
[github-image]: https://badgen.net/badge/icon/lexical-editor?icon=github&label=Github&style=flat-square
[github-url]: https://github.com/jaceyi/lexical-editor

A React rich text editor built on [Lexical](https://lexical.dev/), ready to use out of the box.

- Basic rich text: bold, italic, underline, headings, quotes, lists
- Common styling: color, font size, font family, alignment
- Extensions: links, image/file upload, @mentions, keyword highlighting
- Dual data modes: `html` strings and structured `json` data

## Docs

[Documentation pages](https://lexical-editor-doc.web.app)

## Install

```bash
npm install @jaceyi/lexical-editor
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
