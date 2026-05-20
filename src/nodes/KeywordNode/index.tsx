import { EditorConfig, LexicalNode, TextNode, SerializedTextNode, DOMConversionMap } from 'lexical';

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

  static importDOM(): DOMConversionMap {
    return {
      span: (domNode: Node) => {
        const span = domNode as HTMLElement;
        if (!span.dataset.lexicalKeyword) {
          return null;
        }

        return {
          conversion: () => ({
            node: $createKeywordNode(span.innerText)
          }),
          priority: 1
        };
      }
    };
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'keyword'
    };
  }

  createDOM(config: EditorConfig) {
    const element = document.createElement('span');
    const className = config.theme.textKeyword;
    if (className) {
      element.className = className;
    }
    element.setAttribute('data-lexical-keyword', 'true');
    element.innerText = this.getTextContent();
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
