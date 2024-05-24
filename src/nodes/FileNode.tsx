import React from 'react';
import {
  $applyNodeReplacement,
  DecoratorNode,
  LexicalNode,
  Spread,
  SerializedLexicalNode,
  EditorConfig,
  DOMConversionMap
} from 'lexical';
import { FileComponent } from './FileComponent';

export type SerializedFileNode = Spread<
  {
    url: string;
    name: string;
  },
  SerializedLexicalNode
>;

export interface FilePayload {
  key?: string;
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
    return new FileNode({
      key: node.__key,
      url: node.__url,
      name: node.__name
    });
  }

  static importJSON(serializedNode: SerializedFileNode) {
    const { url, name } = serializedNode;
    return $createFileNode({
      url,
      name
    });
  }

  static importDOM(): DOMConversionMap {
    return {
      a: () => ({
        conversion: (domNode: Node) => {
          const a = domNode as HTMLAnchorElement;
          return {
            node: $createFileNode({
              url: a.href,
              name: a.innerText
            })
          };
        },
        priority: 1
      })
    };
  }

  constructor({ key, url, name }: FilePayload) {
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
    const dom = document.createElement('span');
    const className = config.theme.file;
    if (className) {
      dom.className = className;
    }
    return dom;
  }

  exportDOM() {
    const element = document.createElement('a');
    element.href = this.__url;
    element.innerText = this.__name;
    return {
      element
    };
  }

  updateDOM() {
    return false;
  }

  decorate() {
    return (
      <FileComponent
        url={this.__url}
        name={this.__name}
        nodeKey={this.getKey()}
      />
    );
  }
}

export const $isFileNode = (
  node: LexicalNode | null | undefined
): node is FileNode => node instanceof FileNode;

export const $createFileNode = (payload: FilePayload) => {
  return $applyNodeReplacement<FileNode>(new FileNode(payload));
};
