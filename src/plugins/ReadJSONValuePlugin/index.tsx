import React, { useEffect, useRef } from 'react';
import { $createParagraphNode, $getRoot, $insertNodes, SKIP_DOM_SELECTION_TAG } from 'lexical';
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
    let json = {};
    if (isMountRef.current) {
      json = value ?? {};
    } else {
      json = value ?? initialValue ?? {};
    }

    editor.update(
      () => {
        if (json && Object.keys(json).length) {
          try {
            const editorState = editor.parseEditorState(JSON.stringify(json));
            editor.setEditorState(editorState);
            return;
          } catch (error) {
            console.error('ReadJSONValuePlugin error', error);
          }
        }
        $getRoot().clear().select();
        $insertNodes([$createParagraphNode()]);
      },
      {
        tag: [SKIP_DOM_SELECTION_TAG]
      }
    );
    isMountRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return null;
};
