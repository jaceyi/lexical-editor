import React, { useEffect, useCallback, useRef } from 'react';
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  CLICK_COMMAND,
  KEY_DELETE_COMMAND,
  KEY_BACKSPACE_COMMAND,
  COMMAND_PRIORITY_LOW,
  NodeKey
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import { $isImageNode } from './ImageNode';

export interface ImageComponentProps {
  nodeKey: NodeKey;
  src: string;
  altText?: string;
  className?: string;
}

export const ImageComponent: React.FC<ImageComponentProps> = ({
  nodeKey,
  src,
  altText
}) => {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);

  const onDelete = useCallback(
    (payload: KeyboardEvent) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        const event = payload;
        event.preventDefault();
        const node = $getNodeByKey(nodeKey);
        if ($isImageNode(node)) {
          node.remove();
          return true;
        }
      }
      return false;
    },
    [isSelected, nodeKey]
  );

  const nodeRef = useRef(null);
  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        CLICK_COMMAND,
        payload => {
          const event = payload;
          if (event.target === nodeRef.current) {
            if (event.shiftKey) {
              setSelected(!isSelected);
            } else {
              clearSelection();
              setSelected(true);
            }
            return true;
          }

          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW
      )
    );
  }, [clearSelection, editor, isSelected, nodeKey, onDelete, setSelected]);
  const isEditable = editor.isEditable();

  return (
    <img
      className={isEditable && isSelected ? 'editor__Node_focused' : ''}
      ref={nodeRef}
      src={src}
      alt={altText}
    />
  );
};
