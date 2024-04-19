import { useEffect, useCallback, useRef } from 'react';
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  CLICK_COMMAND,
  KEY_DELETE_COMMAND,
  KEY_BACKSPACE_COMMAND,
  COMMAND_PRIORITY_LOW
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import PropTypes from 'prop-types';
import { $isImageNode } from '.';

export const ImageComponent = ({ src, nodeKey, altText }) => {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);
  const onDelete = useCallback(
    payload => {
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

  const imageRef = useRef();
  useEffect(() => {
    const unregister = mergeRegister(
      editor.registerCommand(
        CLICK_COMMAND,
        payload => {
          const event = payload;
          if (event.target === imageRef.current) {
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
    <img
      className={isSelected ? 'focused' : ''}
      ref={imageRef}
      src={src}
      alt={altText}
    />
  );
};

ImageComponent.propTypes = {
  src: PropTypes.string.isRequired,
  nodeKey: PropTypes.string.isRequired,
  altText: PropTypes.string
};
