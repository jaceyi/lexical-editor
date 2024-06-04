import React from 'react';
import type { EditorConfig, Spread } from 'lexical';
import {
  $applyNodeReplacement,
  DOMConversionMap,
  LexicalNode,
  NodeKey,
  SerializedTextNode,
  DecoratorNode
} from 'lexical';
import { MentionComponent } from './MentionComponent';

export type SerializedMentionNode = Spread<
  {
    trigger: string;
    text: string;
    value: string | number;
  },
  SerializedTextNode
>;

export interface MentionPayload {
  key?: NodeKey;
  trigger: string;
  text: string;
  value: string | number;
}

export class MentionNode extends DecoratorNode<React.JSX.Element> {
  __trigger: string;
  __value: string | number;
  __text: string;

  static getType(): string {
    return 'mention';
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode({
      trigger: node.__trigger,
      value: node.__value,
      text: node.__text
    });
  }

  static importJSON(serializedNode: SerializedMentionNode) {
    return $createMentionNode({
      trigger: serializedNode.trigger,
      value: serializedNode.value,
      text: serializedNode.text
    });
  }

  static importDOM(): DOMConversionMap {
    return {
      span: () => ({
        conversion: (domNode: Node) => {
          const dom = domNode as HTMLElement;
          if (!dom.dataset.lexicalMention) {
            return null;
          }
          return {
            node: $createMentionNode({
              trigger: dom.dataset.lexicalMentionTrigger || '',
              value: dom.dataset.lexicalMentionValue || '',
              text: dom.innerText
            })
          };
        },
        priority: 1
      })
    };
  }

  constructor({ key, trigger, text, value }: MentionPayload) {
    super(key);
    this.__trigger = trigger;
    this.__value = value;
    this.__text = text;
  }

  getTextContent() {
    return this.__text;
  }

  exportJSON() {
    return {
      key: this.getKey(),
      trigger: this.__trigger,
      value: this.__value,
      text: this.__text,
      type: this.getType(),
      version: 1
    };
  }

  createDOM(config: EditorConfig) {
    const span = document.createElement('span');
    const className = config.theme.mentions?.container;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
  }

  exportDOM() {
    const element = document.createElement('span');
    const dataPrefix = 'data-lexical-mention';
    element.setAttribute(dataPrefix, 'true');
    element.setAttribute(`${dataPrefix}-trigger`, this.__trigger);
    if (this.__value) {
      element.setAttribute(`${dataPrefix}-value`, String(this.__value));
    }
    element.innerText = this.__text;
    return { element };
  }

  updateDOM() {
    return false;
  }

  decorate() {
    return (
      <MentionComponent
        text={this.__text}
        value={this.__value}
        nodeKey={this.getKey()}
      />
    );
  }
}

export const $isMentionNode = (
  node: LexicalNode | null | undefined
): node is MentionNode => {
  return node instanceof MentionNode;
};

export const $createMentionNode = (payload: MentionPayload) => {
  return $applyNodeReplacement<MentionNode>(new MentionNode(payload));
};
