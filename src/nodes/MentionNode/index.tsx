import type {
  DOMConversion,
  DOMConversionMap,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedTextNode,
  Spread
} from 'lexical';
import { $applyNodeReplacement, TextNode } from 'lexical';
import { addClassNamesToElement } from '@lexical/utils';

export type SerializedMentionNode = Spread<
  {
    trigger: string;
    value: string | number;
  },
  SerializedTextNode
>;

export interface MentionPayload {
  trigger: string;
  text: string;
  value: string | number;
}

const setMentionDOMAttributes = (
  element: HTMLElement,
  { trigger, value }: Pick<MentionPayload, 'trigger' | 'value'>
) => {
  const dataPrefix = 'data-lexical-mention';
  element.setAttribute(dataPrefix, 'true');
  element.setAttribute(`${dataPrefix}-trigger`, trigger);
  if (value) {
    element.setAttribute(`${dataPrefix}-value`, String(value));
  }
};

export class MentionNode extends TextNode {
  __trigger: string;
  __value: string | number;

  static getType(): string {
    return 'mention';
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(
      {
        trigger: node.__trigger,
        value: node.__value,
        text: node.__text
      },
      node.__key
    );
  }

  afterCloneFrom(prevNode: this): void {
    super.afterCloneFrom(prevNode);
    this.__trigger = prevNode.__trigger;
    this.__value = prevNode.__value;
  }

  static importJSON(serializedNode: SerializedMentionNode) {
    const mentionNode = $createMentionNode({
      trigger: serializedNode.trigger,
      value: serializedNode.value,
      text: serializedNode.text
    });
    mentionNode.setFormat(serializedNode.format || 0);
    mentionNode.setDetail(serializedNode.detail || 0);
    mentionNode.setStyle(serializedNode.style || '');
    return mentionNode;
  }

  static importDOM(): DOMConversionMap {
    return {
      span: (domNode: Node): DOMConversion | null => {
        const element = domNode as HTMLElement;
        if (!element.dataset.lexicalMention) {
          return null;
        }

        return {
          conversion: () => {
            const mentionNode = $createMentionNode({
              trigger: element.dataset.lexicalMentionTrigger || '',
              value: element.dataset.lexicalMentionValue || '',
              // 用 textContent 而非 innerText：jsdom 等环境下未渲染元素的 innerText 为 undefined
              text: element.textContent || ''
            });
            // 保留内联样式，否则重新导入后字体颜色、背景色、字号等会丢失
            const style = element.getAttribute('style');
            if (style) {
              mentionNode.setStyle(style);
            }
            return { node: mentionNode };
          },
          priority: 1
        };
      }
    };
  }

  constructor({ trigger, text, value }: MentionPayload, key?: NodeKey) {
    super(text, key);
    this.__trigger = trigger;
    this.__value = value;
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      trigger: this.__trigger,
      value: this.__value,
      version: 1
    };
  }

  createDOM(config: EditorConfig) {
    const element = super.createDOM(config);
    addClassNamesToElement(element, config.theme.nodeMention);
    setMentionDOMAttributes(element, {
      trigger: this.__trigger,
      value: this.__value
    });
    return element;
  }

  exportDOM(editor: LexicalEditor) {
    const { element } = super.exportDOM(editor);
    if (!(element instanceof HTMLElement)) {
      return { element };
    }

    let outputElement: HTMLElement = element;

    // TextNode 导出时会在最内层 <span> 外面套 <b>/<i>/<u>/<s>，
    // 这里定位到最内层元素并统一换成 <span>，保证 importDOM 只认 span[data-lexical-mention]。
    let innerElement: HTMLElement = element;
    for (
      let child = innerElement.firstElementChild as HTMLElement | null;
      child !== null && innerElement.childNodes.length === 1;
      child = innerElement.firstElementChild as HTMLElement | null
    ) {
      innerElement = child;
    }

    let mentionElement = innerElement;
    if (innerElement.tagName !== 'SPAN') {
      const span = innerElement.ownerDocument.createElement('span');
      for (const attribute of Array.from(innerElement.attributes)) {
        span.setAttribute(attribute.name, attribute.value);
      }
      while (innerElement.firstChild !== null) {
        span.appendChild(innerElement.firstChild);
      }
      const parentElement = innerElement.parentElement;
      if (parentElement !== null) {
        parentElement.replaceChild(span, innerElement);
      } else {
        outputElement = span;
      }
      mentionElement = span;
    }

    setMentionDOMAttributes(mentionElement, {
      trigger: this.__trigger,
      value: this.__value
    });

    return { element: outputElement };
  }

  updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig) {
    const shouldReplace = super.updateDOM(prevNode, dom, config);
    if (!shouldReplace) {
      setMentionDOMAttributes(dom, {
        trigger: this.__trigger,
        value: this.__value
      });
    }
    return shouldReplace;
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

export const $isMentionNode = (node: LexicalNode | null | undefined): node is MentionNode => {
  return node instanceof MentionNode;
};

export const $createMentionNode = (payload: MentionPayload) => {
  // 以 token 模式插入，使提及整体选中、整体删除
  return $applyNodeReplacement<MentionNode>(new MentionNode(payload).setMode('token'));
};
