import React from 'react';
import {
  $applyNodeReplacement,
  DecoratorNode,
  Spread,
  EditorConfig,
  SerializedLexicalNode,
  NodeKey,
  DOMConversionMap,
  LexicalNode
} from 'lexical';
import { ImageComponent } from './ImageComponent';

export type SerializedImageNode = Spread<
  {
    src: string;
    altText: string;
  },
  SerializedLexicalNode
>;

export interface ImagePayload {
  key?: NodeKey;
  src: string;
  altText: string;
}

export class ImageNode extends DecoratorNode<React.JSX.Element> {
  __src: string;
  __altText: string;

  static getType() {
    return 'image';
  }

  static clone(node: ImageNode) {
    return new ImageNode({
      key: node.__key,
      src: node.__src,
      altText: node.__altText
    });
  }

  static importJSON(serializedNode: SerializedImageNode) {
    const { src, altText } = serializedNode;
    return $createImageNode({
      src,
      altText
    });
  }

  static importDOM(): DOMConversionMap {
    return {
      img: () => ({
        conversion: (domNode: Node) => {
          const img = domNode as HTMLImageElement;
          return {
            node: $createImageNode({
              src: img.src,
              altText: img.alt
            })
          };
        },
        priority: 0
      })
    };
  }

  constructor({ key, src, altText }: ImagePayload) {
    super(key);
    this.__src = src;
    this.__altText = altText;
  }

  exportJSON() {
    return {
      key: this.getKey(),
      src: this.__src,
      altText: this.__altText,
      type: this.getType(),
      version: 1
    };
  }

  createDOM(config: EditorConfig) {
    const dom = document.createElement('span');
    const className = config.theme.image;
    if (className) {
      dom.className = className;
    }
    return dom;
  }

  exportDOM() {
    const element = document.createElement('img');
    element.setAttribute('src', this.__src);
    element.setAttribute('alt', this.__altText);

    return {
      element
    };
  }

  updateDOM() {
    return false;
  }

  decorate() {
    return (
      <ImageComponent
        src={this.__src}
        altText={this.__altText}
        nodeKey={this.getKey()}
      />
    );
  }
}

export const $isImageNode = (
  node: LexicalNode | null | undefined
): node is ImageNode => node instanceof ImageNode;

export const $createImageNode = (payload: ImagePayload) => {
  return $applyNodeReplacement<ImageNode>(new ImageNode(payload));
};
