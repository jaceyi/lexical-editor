import { useEffect } from 'react';
import {
  $createParagraphNode,
  $createRangeSelectionFromDom,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $setSelection,
  COMMAND_PRIORITY_HIGH,
  DROP_COMMAND,
  DRAGOVER_COMMAND
} from 'lexical';
import type { LexicalNode, RangeSelection } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $wrapNodeInElement } from '@lexical/utils';

export const DRAG_DATA_FORMAT = 'application/x-lexical-draggable-node';

export interface DragData {
  nodeKey: string;
}

let dragData: DragData | null = null;

export function setDragData(data: DragData | null) {
  dragData = data;
}

export function getDragData(): DragData | null {
  return dragData;
}

const adjustSelectionAfterMove = (selection: RangeSelection, sourceNode: LexicalNode) => {
  const sourceParent = sourceNode.getParent();
  if (!sourceParent) return;

  const sourceParentKey = sourceParent.getKey();
  const sourceIndex = sourceNode.getIndexWithinParent();

  // 落点选区在 sourceNode 移除前就已生成：同一父节点内前移时，其后的子节点偏移会左移 1
  [selection.anchor, selection.focus].forEach(point => {
    if (point.type === 'element' && point.key === sourceParentKey && point.offset > sourceIndex) {
      point.set(point.key, point.offset - 1, 'element');
    }
  });
};

export const DraggableNodePlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      DROP_COMMAND,
      (event: DragEvent) => {
        const data = getDragData();
        if (!data) return false;

        event.preventDefault();

        const x = event.clientX;
        const y = event.clientY;

        const range = document.caretRangeFromPoint(x, y);
        if (!range) return true;

        const domSelection = window.getSelection();
        if (!domSelection) return true;

        domSelection.removeAllRanges();
        domSelection.addRange(range);

        editor.update(() => {
          const sourceNode = $getNodeByKey(data.nodeKey);
          if (!sourceNode) return;

          const selection = $createRangeSelectionFromDom(domSelection, editor);
          if (!selection) return;

          adjustSelectionAfterMove(selection, sourceNode);
          sourceNode.remove();

          $setSelection(selection);
          const currentSelection = $getSelection();
          if ($isRangeSelection(currentSelection)) {
            currentSelection.insertNodes([sourceNode]);

            const parent = sourceNode.getParent();
            if (parent && $isRootOrShadowRoot(parent)) {
              $wrapNodeInElement(sourceNode, $createParagraphNode).selectEnd();
            }
          }
        });

        setDragData(null);
        return true;
      },
      COMMAND_PRIORITY_HIGH
    );
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      DRAGOVER_COMMAND,
      (event: DragEvent) => {
        if (!getDragData()) return false;
        event.preventDefault();
        if (event.dataTransfer) {
          event.dataTransfer.dropEffect = 'move';
        }
        return true;
      },
      COMMAND_PRIORITY_HIGH
    );
  }, [editor]);

  return null;
};
