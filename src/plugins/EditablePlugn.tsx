import React, { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

export interface EditablePlugnProps {
  isEditable: boolean;
}

export const EditablePlugn: React.FC<EditablePlugnProps> = ({ isEditable }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.setEditable(!!isEditable);
  }, [editor, isEditable]);

  return null;
};
