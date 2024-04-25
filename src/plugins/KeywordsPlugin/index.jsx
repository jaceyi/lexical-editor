import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalTextEntity } from '@lexical/react/useLexicalTextEntity';
import { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { $createKeywordNode, KeywordNode } from '@/nodes/KeywordNode';

export const KeywordsPlugin = ({ keywords }) => {
  let keywordRegex = null;
  // array and string default to case insensitive
  if (Array.isArray(keywords)) {
    keywordRegex = new RegExp(`${keywords.join('|')}`, 'i');
  } else if (typeof keywords === 'string') {
    keywordRegex = new RegExp(keywords, 'i');
  } else if (keywords instanceof RegExp) {
    keywordRegex = new RegExp(keywords);
  }

  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([KeywordNode])) {
      throw new Error('KeywordsPlugin: KeywordNode not registered on editor');
    }
  }, [editor]);

  const createKeywordNode = useCallback(textNode => {
    return $createKeywordNode(textNode.getTextContent());
  }, []);

  const getKeywordMatch = useCallback(text => {
    if (!keywordRegex) return null;
    const matchArr = keywordRegex.exec(text);

    if (!matchArr) return null;

    const keywordLength = matchArr[0].length;
    const startOffset = matchArr.index;
    const endOffset = startOffset + keywordLength;
    return {
      end: endOffset,
      start: startOffset
    };
  }, []);

  useLexicalTextEntity(getKeywordMatch, KeywordNode, createKeywordNode);

  return null;
};

KeywordsPlugin.propTypes = {
  keywords: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
    PropTypes.object
  ])
};
