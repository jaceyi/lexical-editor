import React, { useRef, useCallback, useEffect, useMemo } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalTextEntity } from '@lexical/react/useLexicalTextEntity';
import { $createKeywordNode, KeywordNode } from '../../nodes/KeywordNode';
import { TextNode } from 'lexical';

export interface KeywordsPluginProps {
  keywords: string[] | RegExp;
}

export const KeywordsPlugin: React.FC<KeywordsPluginProps> = ({ keywords }) => {
  const keywordRegexRef = useRef<RegExp | undefined>();
  keywordRegexRef.current = useMemo(() => {
    if (Array.isArray(keywords)) {
      // array default to case insensitive
      return new RegExp(`${keywords.join('|')}`, 'i');
    } else if (keywords instanceof RegExp) {
      return new RegExp(keywords);
    }
  }, [keywords]);

  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([KeywordNode])) {
      throw new Error('KeywordsPlugin: KeywordNode not registered on editor');
    }
  }, [editor]);

  const createKeywordNode = useCallback((textNode: TextNode) => {
    return $createKeywordNode(textNode.getTextContent());
  }, []);

  const getKeywordMatch = useCallback(
    (text: string) => {
      const keywordRegex = keywordRegexRef.current;
      if (!keywordRegex) return null;
      const match = keywordRegex.exec(text);

      if (!match) return null;

      const keywordLength = match[0].length;
      const startOffset = match.index;
      const endOffset = startOffset + keywordLength;
      return {
        end: endOffset,
        start: startOffset
      };
    },
    [keywordRegexRef]
  );

  useLexicalTextEntity(getKeywordMatch, KeywordNode, createKeywordNode);

  return null;
};
