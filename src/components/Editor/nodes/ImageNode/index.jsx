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
    const span = document.createElement('span');
    const theme = config.theme;
    const className = theme.image;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
  }

  static importDOM() {
    return {
      span: domNode => {
        if (
          domNode.getAttribute('data-lexical-type') === 'image' &&
          domNode.querySelector('img')
        ) {
          return {
            conversion: domNode => {
              const img = domNode.querySelector('img');
              return {
                node: $createImageNode({
                  src: img.src,
                  altText: img.alt
                })
              };
            },
            priority: 1
          };
        }
        return null;
      }
    };
  }

  exportDOM(editor) {
    const element = editor.getElementByKey(this.getKey());
    if (!element) return;
    element.setAttribute('data-lexical-type', 'image');
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
