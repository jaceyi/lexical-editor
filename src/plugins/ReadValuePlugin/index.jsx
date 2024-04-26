import { useEffect, useCallback } from 'react';
import { $getSelection, $insertNodes, $selectAll } from 'lexical';
import { $generateNodesFromDOM } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import PropTypes from 'prop-types';

export const ReadValuePlugin = ({ initialValue = '', value, isEditable }) => {
  const [editor] = useLexicalComposerContext();

  const insertHTML = useCallback(
    html => {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(html, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);

        $selectAll();
        $getSelection();
        $insertNodes(nodes);
      });
    },
    [editor]
  );

  useEffect(() => {
    if (typeof value !== 'string') {
      insertHTML(initialValue);
    }
  }, []);

  useEffect(() => {
    if (typeof value === 'string') {
      insertHTML(value);
    }
  }, [insertHTML, value]);

  useEffect(() => {
    editor.setEditable(isEditable);
  }, [editor, isEditable]);

  return null;
};

ReadValuePlugin.propTypes = {
  initialValue: PropTypes.string,
  value: PropTypes.string,
  isEditable: PropTypes.bool
};
