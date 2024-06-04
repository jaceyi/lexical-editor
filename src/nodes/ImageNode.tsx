import React, { Suspense } from 'react';
import type { EditorConfig, Spread } from 'lexical';
import {
  $applyNodeReplacement,
  DecoratorNode,
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
      src: node.__src,
      altText: node.__altText
    });
  }

  static importJSON(serializedNode: SerializedImageNode) {
    return $createImageNode({
      src: serializedNode.src,
      altText: serializedNode.altText
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
    const span = document.createElement('span');
    const theme = config.theme;
    const className = theme.image;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
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
      <Suspense fallback={null}>
        <ImageComponent
          src={this.__src}
          altText={this.__altText}
          nodeKey={this.getKey()}
        />
      </Suspense>
    );
  }
}

export const $isImageNode = (
  node: LexicalNode | null | undefined
): node is ImageNode => node instanceof ImageNode;

export const $createImageNode = (payload: ImagePayload) => {
  return $applyNodeReplacement<ImageNode>(new ImageNode(payload));
};
