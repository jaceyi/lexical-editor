import React, { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { EditorJSONValue } from '../../Editor';

export interface ReadJSONValuePluginProps {
  initialValue?: EditorJSONValue;
  value?: EditorJSONValue;
}

export const ReadJSONValuePlugin: React.FC<ReadJSONValuePluginProps> = ({
  initialValue,
  value
}) => {
  const [editor] = useLexicalComposerContext();
  const isMountRef = useRef(false);

  useEffect(() => {
    try {
      let jsonString = '';
      if (isMountRef.current) {
        jsonString = value ? JSON.stringify(value) : '';
      } else {
        jsonString = value
          ? JSON.stringify(value)
          : initialValue
          ? JSON.stringify(initialValue)
          : '';
      }

      const editorState = editor.parseEditorState(jsonString);
      editor.setEditorState(editorState);
    } catch (error) {
      console.error('ReadJSONValuePlugin error', error);
    } finally {
      isMountRef.current = true;
    }
  }, [editor, initialValue, value]);

  return null;
};
