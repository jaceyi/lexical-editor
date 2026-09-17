import React, { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

export interface EditablePluginProps {
  isEditable: boolean;
}

/** 插件：同步编辑器的可编辑状态 */
export const EditablePlugin: React.FC<EditablePluginProps> = ({ isEditable }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.setEditable(!!isEditable);
  }, [editor, isEditable]);

  return null;
};
