import { useEffect } from 'react';
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  createCommand
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $wrapNodeInElement } from '@lexical/utils';
import { FilePayload, $createFileNode } from '../../nodes/FileNode';

export const INSERT_FILE_COMMAND = createCommand<FilePayload>('INSERT_FILE_COMMAND');

export const FilePlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      INSERT_FILE_COMMAND,
      (payload: FilePayload) => {
        const fileNode = $createFileNode(payload);
        $insertNodes([fileNode]);
        if ($isRootOrShadowRoot(fileNode.getParentOrThrow())) {
          $wrapNodeInElement(fileNode, $createParagraphNode).selectEnd();
        }

        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  return null;
};
