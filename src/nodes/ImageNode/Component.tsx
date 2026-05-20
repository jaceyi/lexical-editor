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
import { $isImageNode, $updateImageWidthHeight } from './index';

export interface ImageComponentProps {
  nodeKey: NodeKey;
  src: string;
  altText?: string;
  width?: number | null;
  height?: number | null;
  className?: string;
}

const MIN_WIDTH = 50;

export const ImageComponent: React.FC<ImageComponentProps> = ({
  nodeKey,
  src,
  altText,
  width,
  height
}) => {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);

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

  const nodeRef = useRef<HTMLSpanElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const resizingRef = useRef(false);
  const startWidthRef = useRef(0);
  const startClientXRef = useRef(0);
  const aspectRatioRef = useRef(1);
  const maxWidthRef = useRef(Infinity);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        CLICK_COMMAND,
        payload => {
          const event = payload;
          if (event.target === nodeRef.current || nodeRef.current?.contains(event.target as Node)) {
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
      editor.registerCommand(KEY_DELETE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_BACKSPACE_COMMAND, onDelete, COMMAND_PRIORITY_LOW)
    );
  }, [clearSelection, editor, isSelected, nodeKey, onDelete, setSelected]);

  const handleImageLoad = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    aspectRatioRef.current = img.naturalWidth / img.naturalHeight;

    if (width == null && height == null) {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isImageNode(node) && node.__width == null) {
          $updateImageWidthHeight(node, img.naturalWidth, img.naturalHeight);
        }
      });
    }
  }, [editor, nodeKey, width, height]);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const img = imgRef.current;
      if (!img) return;

      const contentEditable = img.closest('[contenteditable="true"]');
      const editorContentWidth = contentEditable ? contentEditable.clientWidth : Infinity;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;

      resizingRef.current = true;
      startClientXRef.current = clientX;
      startWidthRef.current = img.offsetWidth;
      aspectRatioRef.current = img.naturalWidth / img.naturalHeight;
      maxWidthRef.current = editorContentWidth;

      const span = nodeRef.current;
      if (span) span.classList.add('image-resizing');

      const updateWidth = (clientX: number) => {
        if (!resizingRef.current) return;
        const delta = clientX - startClientXRef.current;
        const newWidth = Math.max(
          MIN_WIDTH,
          Math.min(startWidthRef.current + delta, maxWidthRef.current)
        );
        const newHeight = Math.round(newWidth / aspectRatioRef.current);

        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if ($isImageNode(node)) {
            $updateImageWidthHeight(node, newWidth, newHeight);
          }
        });
      };

      const handleEnd = () => {
        resizingRef.current = false;
        if (span) span.classList.remove('image-resizing');
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', handleEnd);
        document.removeEventListener('touchcancel', handleEnd);
      };

      const onMouseMove = (moveEvent: MouseEvent) => updateWidth(moveEvent.clientX);
      const onTouchMove = (touchEvent: TouchEvent) => {
        touchEvent.preventDefault();
        updateWidth(touchEvent.touches[0].clientX);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', onTouchMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
      document.addEventListener('touchcancel', handleEnd);
    },
    [editor, nodeKey]
  );

  const isEditable = editor.isEditable();
  const showResizeHandle = isEditable && isSelected;

  const imgStyle: React.CSSProperties =
    width != null && height != null ? { width: `${width}px`, height: `${height}px` } : {};

  return (
    <span ref={nodeRef}>
      <img
        className={isEditable && isSelected ? 'editor__Node_focused' : ''}
        ref={imgRef}
        src={src}
        alt={altText}
        style={imgStyle}
        onLoad={handleImageLoad}
      />
      {showResizeHandle && (
        <>
          <span
            className="image-resize-handle image-resize-handle--tr"
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeStart}
          />
          <span
            className="image-resize-handle image-resize-handle--br"
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeStart}
          />
        </>
      )}
    </span>
  );
};
