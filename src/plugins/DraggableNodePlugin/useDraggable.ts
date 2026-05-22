import { useCallback } from 'react';
import { NodeKey } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { DRAG_DATA_FORMAT, setDragData } from './index';

const DRAGGING_CLASS = 'node-dragging';

export function useDraggable(nodeKey: NodeKey) {
  const [editor] = useLexicalComposerContext();
  const isEditable = editor.isEditable();

  const handleDragStart = useCallback(
    (event: React.DragEvent) => {
      event.stopPropagation();
      setDragData({ nodeKey });
      event.dataTransfer.setData(DRAG_DATA_FORMAT, nodeKey);
      event.dataTransfer.setData('text/plain', '');
      event.dataTransfer.effectAllowed = 'move';

      event.currentTarget.classList.add(DRAGGING_CLASS);
    },
    [nodeKey]
  );

  const handleDragEnd = useCallback((event: React.DragEvent) => {
    setDragData(null);
    event.currentTarget.classList.remove(DRAGGING_CLASS);
  }, []);

  return {
    draggable: isEditable,
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd
  };
}
