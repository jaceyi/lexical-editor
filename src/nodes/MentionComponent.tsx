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
import { $isMentionNode } from './MentionNode';

export interface MentionComponentProps {
  nodeKey: NodeKey;
  trigger: string;
  text: string;
  value: string | number;
}

export const MentionComponent: React.FC<MentionComponentProps> = ({
  nodeKey,
  trigger,
  text,
  value
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
        if ($isMentionNode(node)) {
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
            clearSelection();
            setSelected(true);
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
  }, [clearSelection, editor, onDelete, setSelected]);

  return (
    <span
      className={isSelected ? 'editor__Node_focused' : ''}
      data-lexical-mention-trigger={trigger}
      data-lexical-mention-value={value}
      ref={nodeRef}
    >
      {text}
    </span>
  );
};
