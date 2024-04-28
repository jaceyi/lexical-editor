import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import PropTypes from 'prop-types';

export const EditablePlugn = ({ isEditable }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.setEditable(isEditable);
  }, [editor, isEditable]);

  return null;
};

EditablePlugn.propTypes = {
  isEditable: PropTypes.bool
};
