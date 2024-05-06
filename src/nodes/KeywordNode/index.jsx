import { TextNode } from 'lexical';

export class KeywordNode extends TextNode {
  static getType() {
    return 'keyword';
  }

  static clone(node) {
    return new KeywordNode(node.__text, node.__key);
  }

  static importJSON(serializedNode) {
    const node = $createKeywordNode(serializedNode.text);
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'keyword'
    };
  }

  exportDOM(editor) {
    const element = editor.getElementByKey(this.getKey());
    if (!element) return;
    return {
      element: element.cloneNode(true)
    };
  }

  createDOM(config) {
    const dom = super.createDOM(config);
    const className = config.theme.keyword;
    if (className) {
      dom.className = className;
    }
    return dom;
  }

  canInsertTextBefore() {
    return false;
  }

  canInsertTextAfter() {
    return false;
  }

  isTextEntity() {
    return true;
  }
}

export const $createKeywordNode = keyword => {
  return new KeywordNode(keyword);
};

export const $isKeywordNode = node => {
  return node instanceof KeywordNode;
};
