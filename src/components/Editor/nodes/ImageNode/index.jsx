import { $applyNodeReplacement, DecoratorNode } from 'lexical';
import { ImageComponent } from './ImageComponent';

export class ImageNode extends DecoratorNode {
  static getType() {
    return 'image';
  }

  static clone(node) {
    return new ImageNode({
      key: node.__key,
      src: node.__src,
      altText: node.__altText
    });
  }

  static importJSON(serializedNode) {
    const { src, altText } = serializedNode;
    return $createImageNode({
      src,
      altText
    });
  }

  static importDOM() {
    return {
      img: () => ({
        conversion: img => {
          return {
            node: $createImageNode({
              src: img.src,
              altText: img.alt
            })
          };
        },
        priority: 1
      })
    };
  }

  constructor({ key, src, altText }) {
    super(key);
    this.__src = src;
    this.__altText = altText;
  }

  exportJSON() {
    return {
      key: this.getKey(),
      type: this.getType(),
      src: this.__src,
      altText: this.__altText
    };
  }

  createDOM(config) {
    const dom = document.createElement('span');
    const className = config.theme.image;
    if (className) {
      dom.className = className;
    }
    return dom;
  }

  exportDOM(editor) {
    const element = editor.getElementByKey(this.getKey());
    if (!element) return;
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

export const $isImageNode = node => node instanceof ImageNode;
export const $createImageNode = payload => {
  return $applyNodeReplacement(new ImageNode(payload));
};
