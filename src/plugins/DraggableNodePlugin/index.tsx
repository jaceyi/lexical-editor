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
