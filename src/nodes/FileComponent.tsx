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
import { $isFileNode } from './FileNode';

export interface FileComponentProps {
  nodeKey: NodeKey;
  url: string;
  name: string;
}

export const FileComponent: React.FC<FileComponentProps> = ({
  nodeKey,
  url,
  name
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
        if ($isFileNode(node)) {
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
    const unregister = mergeRegister(
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
    return () => {
      unregister();
    };
  }, [clearSelection, editor, isSelected, nodeKey, onDelete, setSelected]);

  return (
    <span className={isSelected ? 'editor__Node_focused' : ''} ref={nodeRef}>
      <span className="editor__pointerEvent_none">{name}</span>
      <a target="_blank" rel="noopener noreferrer" href={url}>
        点击查看
      </a>
    </span>
  );
};
