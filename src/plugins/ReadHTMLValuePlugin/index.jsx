import { useEffect, useCallback } from 'react';
import { $selectAll, $getSelection, $insertNodes } from 'lexical';
import { $generateNodesFromDOM } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import PropTypes from 'prop-types';

export const ReadHTMLValuePlugin = ({
  initialValue = '',
  value,
  forceUpdateValueKey
}) => {
  const [editor] = useLexicalComposerContext();

  const insertHTML = useCallback(html => {
    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(html, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);

      $selectAll();
      $getSelection();
      $insertNodes(nodes);
    });
  }, []);

  useEffect(() => {
    if (typeof value !== 'string') {
      insertHTML(initialValue);
    }
  }, []);

  useEffect(() => {
    if (typeof value === 'string') {
      insertHTML(value);
    }
  }, [insertHTML, value, forceUpdateValueKey]);

  return null;
};

ReadHTMLValuePlugin.propTypes = {
  initialValue: PropTypes.string,
  value: PropTypes.string,
  forceUpdateValueKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};
