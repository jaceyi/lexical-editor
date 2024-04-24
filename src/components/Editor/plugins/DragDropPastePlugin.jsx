import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { DRAG_DROP_PASTE } from '@lexical/rich-text';
import { COMMAND_PRIORITY_LOW } from 'lexical';
import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { INSERT_IMAGE_COMMAND } from './ImagePlugin';

export const DragDropPastePlugin = ({ onFileUpload }) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerCommand(
      DRAG_DROP_PASTE,
      files => {
        (async () => {
          for (const file of files) {
            try {
              const image = await onFileUpload(file);
              editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                src: image.url,
                altText: image.name
              });
            } catch {}
          }
        })();
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor, onFileUpload]);

  return null;
};

DragDropPastePlugin.propTypes = {
  onFileUpload: PropTypes.func
};
