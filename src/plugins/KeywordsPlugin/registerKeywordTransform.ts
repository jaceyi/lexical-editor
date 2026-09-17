import { $createTextNode, LexicalEditor, TextNode } from 'lexical';
import { mergeRegister } from '@lexical/utils';
import { $createKeywordNode, KeywordNode } from '../../nodes/KeywordNode';

interface KeywordRange {
  start: number;
  end: number;
}

/**
 * 找出文本中所有关键字的匹配区间。
 * 正则必须带 g 标志，否则 exec 无法遍历出多处匹配。
 */
const $findKeywordRanges = (regex: RegExp, text: string): KeywordRange[] => {
  const ranges: KeywordRange[] = [];
  regex.lastIndex = 0;
  let match = regex.exec(text);
  while (match !== null) {
    if (match[0] === '') {
      // 空匹配时手动前进一位，避免 exec 原地死循环
      regex.lastIndex += 1;
    } else {
      ranges.push({ start: match.index, end: match.index + match[0].length });
    }
    match = regex.exec(text);
  }
  return ranges;
};

/** 文本开头处匹配到的关键字长度，未匹配返回 0 */
const $getKeywordLengthAtStart = (regex: RegExp, text: string): number => {
  regex.lastIndex = 0;
  const match = regex.exec(text);
  return match !== null && match.index === 0 ? match[0].length : 0;
};

/** 保留原文本节点的格式与内联样式：HTML 导入的颜色、背景色、字号、加粗等 */
const $createKeywordNodeFrom = (textNode: TextNode) => {
  const keywordNode = $createKeywordNode(textNode.getTextContent());
  keywordNode.setFormat(textNode.getFormat());
  keywordNode.setStyle(textNode.getStyle());
  keywordNode.setDetail(textNode.getDetail());
  return keywordNode;
};

const $replaceWithPlainText = (node: TextNode) => {
  const textNode = $createTextNode(node.getTextContent());
  textNode.setFormat(node.getFormat());
  textNode.setStyle(node.getStyle());
  textNode.setDetail(node.getDetail());
  node.replace(textNode);
};

/**
 * 注册关键字高亮转换：
 * - 普通文本中的匹配片段替换为 KeywordNode，同一节点内的多处匹配都会处理；
 * - 不再完整匹配的 KeywordNode 还原为普通文本。
 *
 * 没有使用 useLexicalTextEntity：该实现遇到“紧邻提及节点”或“紧邻上一个关键字”的文本时会跳过匹配。
 */
export const registerKeywordTransform = (editor: LexicalEditor, keywordRegex: RegExp) =>
  mergeRegister(
    editor.registerNodeTransform(TextNode, node => {
      // 只处理普通文本：提及、关键字等实体节点（token、segmented）不参与匹配
      if (!node.isSimpleText()) return;
      const text = node.getTextContent();
      if (text === '') return;
      const ranges = $findKeywordRanges(keywordRegex, text);
      if (ranges.length === 0) return;

      // 从后往前替换，已拆分的部分不会影响剩余匹配的偏移
      for (let i = ranges.length - 1; i >= 0; i--) {
        const { start, end } = ranges[i];
        if (start === 0 && end === node.getTextContentSize()) {
          node.replace($createKeywordNodeFrom(node));
          continue;
        }
        // start > 0 时返回 [前段, 匹配段, 后段]；start === 0 时前段为空会被省略
        const splitNodes = node.splitText(start, end);
        const matchedNode = splitNodes[start === 0 ? 0 : 1];
        matchedNode.replace($createKeywordNodeFrom(matchedNode));
      }
    }),
    editor.registerNodeTransform(KeywordNode, node => {
      const text = node.getTextContent();
      const matchedLength = $getKeywordLengthAtStart(keywordRegex, text);
      if (matchedLength === text.length) return;

      if (matchedLength > 0) {
        // 关键字后面又被输入了内容：多出的部分拆成普通文本节点继续处理
        node.splitText(matchedLength);
        return;
      }
      // 整体不再匹配（关键字配置变化或内容被编辑），还原为普通文本
      $replaceWithPlainText(node);
    })
  );
