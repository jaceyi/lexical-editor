import React, { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { DRAG_DROP_PASTE } from '@lexical/rich-text';
import { COMMAND_PRIORITY_LOW } from 'lexical';
import { INSERT_FILE_COMMAND } from '../FilePlugin';
import { INSERT_IMAGE_COMMAND } from '../ImagePlugin';
import type { UploadFile } from '../../types';
import * as typeGuards from '../../utils/typeGuards';

export interface DragDropPastePluginProps {
  onUploadFile: UploadFile;
}

export const DragDropPastePlugin: React.FC<DragDropPastePluginProps> = ({ onUploadFile }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      DRAG_DROP_PASTE,
      files => {
        if (typeGuards.isFunction(onUploadFile)) {
          (async () => {
            for (const file of files) {
              try {
                const uploaded = await onUploadFile(file);
                if (/^image\/.+$/.test(file.type)) {
                  editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                    src: uploaded.url,
                    altText: uploaded.name
                  });
                } else {
                  editor.dispatchCommand(INSERT_FILE_COMMAND, {
                    url: uploaded.url,
                    name: uploaded.name
                  });
                }
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
