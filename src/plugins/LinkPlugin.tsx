import { useEffect } from 'react';
import {
  $createTextNode,
  $insertNodes,
  COMMAND_PRIORITY_LOW,
  createCommand,
  TextNode
} from 'lexical';
import { $createLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';

interface LinkPayload {
  url: string;
  name: string;
}

export const INSERT_FILE_LINK_COMMAND = createCommand(
  'INSERT_FILE_LINK_COMMAND'
);

export const LinkPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        INSERT_FILE_LINK_COMMAND,
        (payload: LinkPayload) => {
          $insertNodes([
            new TextNode(' '),
            $createLinkNode(payload.url, { target: '_blank' }).append(
              $createTextNode(payload.name)
            ),
            new TextNode(' ')
          ]);
          editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
          return true;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor]);

  return null;
};
