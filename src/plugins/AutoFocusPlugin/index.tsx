import React, { useLayoutEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

interface AutoFocusPluginProps {
  autoFocus: boolean;
}

export const AutoFocusPlugin: React.FC<AutoFocusPluginProps> = ({ autoFocus }) => {
  const [editor] = useLexicalComposerContext();

  useLayoutEffect(() => {
    if (editor.isEditable() && autoFocus) {
      setTimeout(() => {
        editor.focus();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};
