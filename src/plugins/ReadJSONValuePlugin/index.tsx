import React, { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { EditorJSONValue } from '../../Editor';

export interface ReadJSONValuePluginProps {
  initialValue?: string | EditorJSONValue;
  value?: string | EditorJSONValue;
}

const parseJSONValue = (input: string | EditorJSONValue | undefined): EditorJSONValue | null => {
  if (!input) return null;
  if (typeof input === 'string') {
    try {
      return JSON.parse(input) as EditorJSONValue;
    } catch {
      return null;
    }
  }
  return input;
};

export const ReadJSONValuePlugin: React.FC<ReadJSONValuePluginProps> = ({
  initialValue,
  value
}) => {
  const [editor] = useLexicalComposerContext();
  const isMountRef = useRef(false);

  useEffect(() => {
    const rawValue = isMountRef.current ? value : value ?? initialValue;
    const serialized = parseJSONValue(rawValue);

    if (!serialized) {
      isMountRef.current = true;
      return;
    }

    try {
      const editorState = editor.parseEditorState(JSON.stringify(serialized));
      editor.setEditorState(editorState);
    } catch {
      // ignore parse errors from invalid external JSON payload
    } finally {
      isMountRef.current = true;
    }
  }, [editor, initialValue, value]);

  return null;
};
