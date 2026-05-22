import {
  EditorConfig,
  LexicalNode,
  TextNode,
  SerializedTextNode,
  $applyNodeReplacement
} from 'lexical';
import { addClassNamesToElement } from '@lexical/utils';
export class KeywordNode extends TextNode {
  static getType() {
    return 'keyword';
  }

  static clone(node: TextNode) {
    return new KeywordNode(node.__text, node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = super.createDOM(config);
    addClassNamesToElement(element, config.theme.textKeyword);
    return element;
  }

  static importJSON(serializedNode: SerializedTextNode) {
    return $createKeywordNode().updateFromJSON(serializedNode);
  }

  isTextEntity() {
    return true;
  }
}

export const $isKeywordNode = (node: LexicalNode | null | undefined): node is KeywordNode => {
  return node instanceof KeywordNode;
};

export const $createKeywordNode = (keyword: string = '') => {
  return $applyNodeReplacement(new KeywordNode(keyword));
};
