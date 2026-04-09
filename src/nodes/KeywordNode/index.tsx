import { EditorConfig, LexicalNode, TextNode, SerializedTextNode } from 'lexical';

export class KeywordNode extends TextNode {
  static getType() {
    return 'keyword';
  }

  static clone(node: TextNode) {
    return new KeywordNode(node.__text, node.__key);
  }

  static importJSON(serializedNode: SerializedTextNode) {
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

  createDOM(config: EditorConfig) {
    const element = super.createDOM(config);
    const className = config.theme.textKeyword;
    if (className) {
      element.className = className;
    }
    return element;
  }

  canInsertTextBefore() {
    return true;
  }

  canInsertTextAfter() {
    return true;
  }

  isTextEntity() {
    return true;
  }
}

export const $isKeywordNode = (node: LexicalNode | null | undefined): node is KeywordNode => {
  return node instanceof KeywordNode;
};

export const $createKeywordNode = (keyword: string) => {
  return new KeywordNode(keyword);
};
