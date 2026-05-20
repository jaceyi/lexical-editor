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
import { ImageComponent } from './Component';

export type SerializedImageNode = Spread<
  {
    src: string;
    altText: string;
    width: number | null;
    height: number | null;
  },
  SerializedLexicalNode
>;

export interface ImagePayload {
  src: string;
  altText: string;
  width?: number | null;
  height?: number | null;
}

export class ImageNode extends DecoratorNode<React.JSX.Element> {
  __src: string;
  __altText: string;
  __width: number | null;
  __height: number | null;

  static getType() {
    return 'image';
  }

  static clone(node: ImageNode) {
    return new ImageNode(
      {
        src: node.__src,
        altText: node.__altText,
        width: node.__width,
        height: node.__height
      },
      node.__key
    );
  }

  static importJSON(serializedNode: SerializedImageNode) {
    return $createImageNode({
      src: serializedNode.src,
      altText: serializedNode.altText,
      width: serializedNode.width ?? null,
      height: serializedNode.height ?? null
    });
  }

  static importDOM(): DOMConversionMap {
    return {
      img: () => ({
        conversion: (domNode: Node) => {
          const img = domNode as HTMLImageElement;
          const width = img.getAttribute('width');
          const height = img.getAttribute('height');
          return {
            node: $createImageNode({
              src: img.src,
              altText: img.alt,
              width: width ? parseInt(width, 10) : null,
              height: height ? parseInt(height, 10) : null
            })
          };
        },
        priority: 0
      })
    };
  }

  constructor({ src, altText, width, height }: ImagePayload, key?: NodeKey) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width ?? null;
    this.__height = height ?? null;
  }

  exportJSON() {
    return {
      key: this.getKey(),
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      height: this.__height,
      type: this.getType(),
      version: 2
    };
  }

  createDOM(config: EditorConfig) {
    const element = document.createElement('span');
    const className = config.theme.nodeImage;
    if (className !== undefined) {
      element.className = className;
    }
    return element;
  }

  exportDOM() {
    const element = document.createElement('img');
    element.setAttribute('src', this.__src);
    element.setAttribute('alt', this.__altText);
    if (this.__width !== null) {
      element.setAttribute('width', String(this.__width));
    }
    if (this.__height !== null) {
      element.setAttribute('height', String(this.__height));
    }

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
          width={this.__width}
          height={this.__height}
          nodeKey={this.getKey()}
        />
      </Suspense>
    );
  }
}

export const $isImageNode = (node: LexicalNode | null | undefined): node is ImageNode =>
  node instanceof ImageNode;

export const $createImageNode = (payload: ImagePayload) => {
  return $applyNodeReplacement<ImageNode>(new ImageNode(payload));
};

export const $updateImageWidthHeight = (
  node: ImageNode,
  width: number | null,
  height: number | null
) => {
  const writable = node.getWritable();
  writable.__width = width;
  writable.__height = height;
};
