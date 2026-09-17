import { useCallback } from 'react';
import { NodeKey } from 'lexical';
import { useLexicalEditable } from '@lexical/react/useLexicalEditable';
import { DRAG_DATA_FORMAT, setDragData } from './index';

const DRAGGING_CLASS = 'node-dragging';

export function useDraggable(nodeKey: NodeKey) {
  // 订阅可编辑状态，运行期切换 setEditable 时拖拽属性会同步更新
  const isEditable = useLexicalEditable();

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
