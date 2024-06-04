import React, { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { DRAG_DROP_PASTE } from '@lexical/rich-text';
import { COMMAND_PRIORITY_LOW } from 'lexical';
import { INSERT_IMAGE_COMMAND } from './ImagePlugin';
import type { UploadFile } from '../types';

export interface DragDropPastePluginProps {
  onUploadFile: UploadFile;
}

export const DragDropPastePlugin: React.FC<DragDropPastePluginProps> = ({
  onUploadFile
}) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      DRAG_DROP_PASTE,
      files => {
        if (typeof onUploadFile === 'function') {
          (async () => {
            for (const file of files) {
              try {
                const image = await onUploadFile(file);
                editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                  src: image.url,
                  altText: image.name
                });
              } catch {}
            }
          })();
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor, onUploadFile]);

  return null;
};
