import { useEffect } from 'react';
import { $getSelection, $insertNodes, $selectAll } from 'lexical';
import { $generateNodesFromDOM } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import PropTypes from 'prop-types';

export const ReadValuePlugin = ({ value, isEditable }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.setEditable(isEditable);
    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(value, 'text/html');

      const nodes = $generateNodesFromDOM(editor, dom);

      $selectAll();
      $getSelection();

      $insertNodes(nodes);
    });
  }, [editor, value, isEditable]);

  return null;
};

ReadValuePlugin.propTypes = {
  value: PropTypes.string,
  isEditable: PropTypes.bool
};
