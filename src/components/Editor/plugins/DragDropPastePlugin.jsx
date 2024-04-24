import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { DRAG_DROP_PASTE } from '@lexical/rich-text';
import { isMimeType, mediaFileReader } from '@lexical/utils';
import { COMMAND_PRIORITY_LOW } from 'lexical';
import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { INSERT_IMAGE_COMMAND } from './ImagePlugin';

const ACCEPTABLE_IMAGE_TYPES = ['image/'];

export const DragDropPastePlugin = ({ uploadFile }) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerCommand(
      DRAG_DROP_PASTE,
      files => {
        (async () => {
          const filesResult = await mediaFileReader(
            files,
            [ACCEPTABLE_IMAGE_TYPES].flatMap(x => x)
          );
          for (const { file } of filesResult) {
            if (isMimeType(file, ACCEPTABLE_IMAGE_TYPES)) {
              try {
                const image = await uploadFile(file);
                editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                  src: image.url,
                  altText: image.name
                });
              } catch {}
            }
          }
        })();
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor, uploadFile]);

  return null;
};

DragDropPastePlugin.propTypes = {
  uploadFile: PropTypes.func
};
