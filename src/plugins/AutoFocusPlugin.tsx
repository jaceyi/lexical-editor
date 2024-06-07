import React, { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { EditorFocusOptions } from 'lexical/LexicalEditor';

interface AutoFocusPluginProps {
  autoFocus: boolean;
  defaultSelection?: EditorFocusOptions['defaultSelection'];
}

export const AutoFocusPlugin: React.FC<AutoFocusPluginProps> = ({
  autoFocus,
  defaultSelection
}) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (editor.isEditable()) {
      setTimeout(() => editor.blur());
      if (autoFocus) {
        setTimeout(() => editor.focus(undefined, { defaultSelection }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};
