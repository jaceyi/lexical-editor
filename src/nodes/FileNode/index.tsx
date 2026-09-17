import React, { Suspense } from 'react';
import type {
  DOMConversion,
  DOMConversionMap,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread
} from 'lexical';
import { $applyNodeReplacement, DecoratorNode } from 'lexical';
import { FileComponent } from './Component';

export type SerializedFileNode = Spread<
  {
    url: string;
    name: string;
  },
  SerializedLexicalNode
>;

export interface FilePayload {
  url: string;
  name: string;
}

export class FileNode extends DecoratorNode<React.JSX.Element> {
  __url: string;
  __name: string;

  static getType() {
    return 'file';
  }

  static clone(node: FileNode) {
    return new FileNode(
      {
        url: node.__url,
        name: node.__name
      },
      node.__key
    );
  }

  static importJSON(serializedNode: SerializedFileNode) {
    return $createFileNode({
      url: serializedNode.url,
      name: serializedNode.name
    });
  }

  static importDOM(): DOMConversionMap {
    return {
      // priority 必须高于 LinkNode 的 1，否则带 data-lexical-file 的 <a> 会被当成普通链接导入
      a: (domNode: Node): DOMConversion | null => {
        const element = domNode as HTMLAnchorElement;
        if (!element.dataset.lexicalFile) {
          return null;
        }

        return {
          conversion: () => ({
            node: $createFileNode({
              url: element.getAttribute('href') || '',
              name: element.textContent || ''
            })
          }),
          priority: 2
        };
      }
    };
  }

  constructor({ url, name }: FilePayload, key?: NodeKey) {
    super(key);
    this.__url = url;
    this.__name = name;
  }

  exportJSON() {
    return {
      key: this.getKey(),
      url: this.__url,
      name: this.__name,
      type: this.getType(),
      version: 1
    };
  }

  createDOM(config: EditorConfig) {
    // 编辑区内固定用 span：<a href> 在可编辑区域会被浏览器当成真链接（点击跳转、拖拽变成拖 URL），
    // 下载统一交给组件里的下载按钮
    const element = document.createElement('span');
    const className = config.theme.nodeFile;
    if (className !== undefined) {
      element.className = className;
    }
    element.setAttribute('data-lexical-file', 'true');
    return element;
  }

  exportDOM() {
    // 导出为 <a>，让这段 HTML 在编辑器之外（含直接渲染到页面）也能点击下载
    const element = document.createElement('a');
    element.setAttribute('data-lexical-file', 'true');
    element.textContent = this.__name;
    if (this.__url) {
      element.setAttribute('href', this.__url);
      element.setAttribute('download', this.__name);
    }
    return { element };
  }

  updateDOM() {
    return false;
  }

  decorate() {
    return (
      <Suspense fallback={null}>
        <FileComponent nodeKey={this.getKey()} url={this.__url} name={this.__name} />
      </Suspense>
    );
  }
}

export const $isFileNode = (node: LexicalNode | null | undefined): node is FileNode =>
  node instanceof FileNode;

export const $createFileNode = (payload: FilePayload) => {
  return $applyNodeReplacement<FileNode>(new FileNode(payload));
};

export const $updateFileName = (node: FileNode, name: string) => {
  const writable = node.getWritable();
  writable.__name = name;
};
