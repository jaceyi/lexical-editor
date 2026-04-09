# React Lexical Editor

基于 [Lexical](https://lexical.dev/) 开发的富文本编辑器组件。

## 功能

- 基础富文本：加粗、斜体、下划线
- 块级结构：标题、引用、无序 / 有序列表
- 样式：字体颜色、背景色、字号、字体、对齐
- 链接与图片：插入/编辑链接，图片拖拽/粘贴上传
- @提及、关键词高亮、格式刷、清除格式
- 可读写模式：编辑模式 + 只读渲染模式
- 数据模式：`html` 与 `json` 双模式输入输出

## 安装

```bash
npm install @jaceyi/lexical-editor
# or
yarn add @jaceyi/lexical-editor
```

## 快速上手

引入样式：

```js
import '@jaceyi/lexical-editor/style.css';
```

### HTML 模式

使用 `useHTMLHandle` hook 管理编辑器状态，`value` 为当前 HTML 字符串，`onChange` 用于外部设置编辑器内容。

```tsx
import Editor, { useHTMLHandle } from '@jaceyi/lexical-editor';
import '@jaceyi/lexical-editor/style.css';

const App = () => {
  const [{ value, onChange }, editorProps] = useHTMLHandle({
    initialValue: '<p>Hello World</p>'
  });

  return (
    <>
      <Editor namespace="my-editor" {...editorProps} />
      <button onClick={() => onChange('<p>重置内容</p>')}>重置</button>
      <p>当前值：{value}</p>
    </>
  );
};
```

### JSON 模式

```tsx
import Editor, { useJSONHandle } from '@jaceyi/lexical-editor';

const App = () => {
  const [{ value, onChange }, editorProps] = useJSONHandle();

  return (
    <Editor namespace="my-json-editor" mode="json" {...editorProps} />
  );
};
```

### 图片上传

通过 `config.onUploadFile` 接入上传逻辑，返回图片 `url` 和 `name`：

```tsx
<Editor
  namespace="my-editor"
  config={{
    onUploadFile: async (file) => {
      const url = await uploadToServer(file);
      return { url, name: file.name };
    }
  }}
  {...editorProps}
/>
```

### @提及

`mentions` 支持字符串数组或完整配置对象：

```tsx
// 简单用法
<Editor
  namespace="my-editor"
  config={{
    mentions: ['Alice', 'Bob', 'Charlie']
  }}
  {...editorProps}
/>

// 完整配置
<Editor
  namespace="my-editor"
  config={{
    mentions: {
      mentions: ['Alice', 'Bob'],
      trigger: '@',           // 触发字符，默认 '@'
      validCharsLength: 50,   // 触发后最大匹配长度，默认 50
      suggestionListLength: 5 // 下拉列表最大条数，默认 5
    }
  }}
  {...editorProps}
/>
```

### 关键词高亮

`keywords` 支持字符串数组（不区分大小写）或正则：

```tsx
<Editor
  namespace="my-editor"
  config={{
    keywords: ['lexical', 'editor']
    // 或：keywords: /lexical|editor/gi
  }}
  {...editorProps}
/>
```

### 只读模式

```tsx
<Editor
  namespace="my-editor"
  mode="html"
  isEditable={false}
  value={htmlContent}
/>
```

## API

### `<Editor />`

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `namespace` | `string` | — | 编辑器唯一标识（必填） |
| `mode` | `'html' \| 'json'` | `'html'` | 数据模式 |
| `value` | `string \| EditorJSONValue` | — | 受控值 |
| `initialValue` | `string \| EditorJSONValue` | — | 初始值（非受控） |
| `onChange` | `(value) => void` | — | 内容变更回调 |
| `isEditable` | `boolean` | `true` | 是否可编辑 |
| `autoFocus` | `boolean` | `true` | 是否自动聚焦 |
| `placeholder` | `string` | `'请输入内容'` | 占位文本 |
| `config` | `EditorConfig` | `{}` | 功能插件配置，见下方 |
| `theme` | `EditorThemeClasses` | `{}` | 自定义主题类名 |
| `className` | `string` | — | 外层容器类名 |
| `style` | `CSSProperties` | — | 外层容器样式 |
| `contentStyle` | `CSSProperties` | — | 编辑区域样式 |
| `nodes` | `InitialConfigType['nodes']` | `[]` | 扩展 Lexical 节点 |
| `children` | `ReactNode` | — | 额外插入的 Lexical 插件 |

### `EditorConfig`

| 字段 | 类型 | 说明 |
|------|------|------|
| `onUploadFile` | `(file: File) => Promise<{ url: string; name: string }>` | 图片上传函数 |
| `mentions` | `string[] \| MentionsPluginProps` | @提及配置 |
| `keywords` | `string[] \| RegExp` | 关键词高亮 |

### `MentionsPluginProps`

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `mentions` | `MentionItem[]` | `[]` | 候选人列表 |
| `trigger` | `string \| string[]` | `'@'` | 触发字符 |
| `validCharsLength` | `number` | `50` | 触发后最大匹配长度 |
| `suggestionListLength` | `number` | `5` | 下拉列表最大条数 |

### `useHTMLHandle(options?)`

```ts
const [outputProps, editorProps, editorRef] = useHTMLHandle({ initialValue?: string });
```

- `outputProps.value` — 当前 HTML 字符串
- `outputProps.onChange(html)` — 外部设置编辑器内容
- `editorRef` — 可访问底层 `LexicalEditor` 实例（`editorRef.current?.editor`）

### `useJSONHandle(options?)`

```ts
const [outputProps, editorProps, editorRef] = useJSONHandle({ initialValue?: EditorJSONValue });
```

用法同 `useHTMLHandle`，`value` 类型为 `EditorJSONValue`（即 Lexical EditorState JSON）。

### `EditorRef`

通过 `ref` 直接获取底层编辑器实例：

```tsx
import { useRef } from 'react';
import Editor, { EditorRef } from '@jaceyi/lexical-editor';

const editorRef = useRef<EditorRef>(null);

<Editor ref={editorRef} namespace="my-editor" {...editorProps} />

// 访问 Lexical editor 实例
editorRef.current?.editor
```

## License

MIT
