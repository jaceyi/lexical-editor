import { useEffect } from 'react';
import {
  $getSelection,
  $createParagraphNode,
  $createRangeSelection,
  $insertNodes,
  $isRootOrShadowRoot,
  $isNodeSelection,
  $setSelection,
  DRAGSTART_COMMAND,
  DRAGOVER_COMMAND,
  DROP_COMMAND,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_LOW,
  COMMAND_PRIORITY_HIGH,
  createCommand
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $wrapNodeInElement, mergeRegister } from '@lexical/utils';
import { $isImageNode, $createImageNode } from '../nodes/ImageNode';

export const INSERT_IMAGE_COMMAND = createCommand('INSERT_IMAGE_COMMAND');

export const ImagePlugin = () => {
  const [editor] = useLexicalComposerContext();

  const getImageNodeInSelection = () => {
    const selection = $getSelection();
    if (!$isNodeSelection(selection)) {
      return null;
    }
    const nodes = selection.getNodes();
    const node = nodes[0];
    return $isImageNode(node) ? node : null;
  };

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        INSERT_IMAGE_COMMAND,
        payload => {
          const imageNode = $createImageNode(payload);
          $insertNodes([imageNode]);
          if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
            $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
          }

          return true;
        },
        COMMAND_PRIORITY_EDITOR
      ),
      editor.registerCommand(
        DRAGSTART_COMMAND,
        event => {
          const node = getImageNodeInSelection();
          if (!node) {
            event.preventDefault();
            return false;
          }
          const dataTransfer = event.dataTransfer;
          if (!dataTransfer) {
            return false;
          }
          dataTransfer.setData('text/plain', node.__altText);

          return true;
        },
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerCommand(
        DRAGOVER_COMMAND,
        () => {
          const node = getImageNodeInSelection();
          if (!node) {
            return false;
          }
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        DROP_COMMAND,
        event => {
          const node = getImageNodeInSelection();
          if (!node) {
            return false;
          }
          event.preventDefault();
          const data = getDragImageData(event);
          if (!data) {
            return false;
          }
          const range = getDragSelection(event);
          node.remove();
          const rangeSelection = $createRangeSelection();
          if (range !== null && range !== undefined) {
            rangeSelection.applyDOMRange(range);
          }
          $setSelection(rangeSelection);
          editor.dispatchCommand(INSERT_IMAGE_COMMAND, data);

          return true;
        },
        COMMAND_PRIORITY_HIGH
      )
    );
  }, [editor]);

  return null;
};

function getDragImageData(event) {
  const dragData = event.dataTransfer?.getData('application/x-lexical-drag');
  if (!dragData) {
    return null;
  }
  const { type, data } = JSON.parse(dragData);
  if (type !== 'image') {
    return null;
  }

  return data;
}

function getDragSelection(event) {
  let range;
  const target = event.target;
  const targetWindow =
    target == null
      ? null
      : target.nodeType === 9
      ? target.defaultView
      : target.ownerDocument.defaultView;
  const domSelection = (targetWindow || window).getSelection();
  if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(event.clientX, event.clientY);
  } else if (event.rangeParent && domSelection !== null) {
    domSelection.collapse(event.rangeParent, event.rangeOffset || 0);
    range = domSelection.getRangeAt(0);
  }

  return range;
}
