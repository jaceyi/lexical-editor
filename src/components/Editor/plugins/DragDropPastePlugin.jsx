import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { DRAG_DROP_PASTE } from '@lexical/rich-text';
import { isMimeType, mediaFileReader } from '@lexical/utils';
import { COMMAND_PRIORITY_LOW } from 'lexical';
import { useEffect } from 'react';

import { INSERT_IMAGE_COMMAND } from './ImagePlugin';

const ACCEPTABLE_IMAGE_TYPES = ['image/'];

const DragDropPaste = () => {
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
              // // 一个一个的上传 体验比较好，而不是等所有图片都上传好了再做统一渲染
              // const [image] = await uploadFileList([file]);
              // image &&
              //   editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
              //     src: image.url,
              //     altText: image.name
              //   });
            }
          }
        })();
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  return null;
};

export default DragDropPaste;
