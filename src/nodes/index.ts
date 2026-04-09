import { ListNode, ListItemNode } from '@lexical/list';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ImageNode } from './ImageNode';
import { KeywordNode } from './KeywordNode';
import { MentionNode } from './MentionNode';

/**
 * 汇总导出所有自定义 Lexical 节点，供编辑器的 initialConfig 使用。
 */
export default [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  AutoLinkNode,
  LinkNode,
  ImageNode,
  KeywordNode,
  MentionNode
];
