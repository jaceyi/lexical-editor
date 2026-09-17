import React, { useEffect, useMemo } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { KeywordNode } from '../../nodes/KeywordNode';
import { escapeRegExp } from '../../utils/regex';
import { registerKeywordTransform } from './registerKeywordTransform';

export interface KeywordsPluginProps {
  keywords: string[] | RegExp;
}

/** 匹配关键字的正则统一带 g 标志，便于一次扫描出文本中的所有匹配 */
export const createKeywordRegex = (keywords: string[] | RegExp): RegExp | null => {
  if (Array.isArray(keywords)) {
    // 数组默认忽略大小写；关键字按字面量转义，避免 `C++`、`(foo)` 直接让正则报错
    return keywords.length ? new RegExp(keywords.map(escapeRegExp).join('|'), 'gi') : null;
  }
  if (keywords instanceof RegExp) {
    return new RegExp(
      keywords.source,
      keywords.flags.includes('g') ? keywords.flags : `${keywords.flags}g`
    );
  }
  return null;
};

export const KeywordsPlugin: React.FC<KeywordsPluginProps> = ({ keywords }) => {
  const [editor] = useLexicalComposerContext();
  const keywordRegex = useMemo(() => createKeywordRegex(keywords), [keywords]);

  useEffect(() => {
    if (!editor.hasNodes([KeywordNode])) {
      throw new Error('KeywordsPlugin: KeywordNode not registered on editor');
    }
    if (!keywordRegex) return;
    return registerKeywordTransform(editor, keywordRegex);
  }, [editor, keywordRegex]);

  return null;
};
