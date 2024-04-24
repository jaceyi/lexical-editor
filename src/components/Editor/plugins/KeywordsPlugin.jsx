import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalTextEntity } from '@lexical/react/useLexicalTextEntity';
import { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { $createKeywordNode, KeywordNode } from '../nodes/KeywordNode';

export const KeywordsPlugin = ({ keywords }) => {
  let keywordRegex = new RegExp(keywords.join('|'), 'gi');

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
    const matchArr = keywordRegex.exec(text);

    if (matchArr === null) {
      return null;
    }

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
  keywords: PropTypes.arrayOf(PropTypes.string)
};
