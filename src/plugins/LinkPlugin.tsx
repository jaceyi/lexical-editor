import { useEffect } from 'react';
import {
  $createTextNode,
  $insertNodes,
  COMMAND_PRIORITY_LOW,
  createCommand,
  TextNode
} from 'lexical';
import {
  $createLinkNode,
  TOGGLE_LINK_COMMAND,
  LinkAttributes
} from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelectionPrevNextState } from '../utils';

interface LinkPayload {
  url: string;
  text: string;
  attributes: LinkAttributes;
}

export const INSERT_LINK_COMMAND = createCommand('INSERT_LINK_COMMAND');

export const LinkPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      INSERT_LINK_COMMAND,
      (payload: LinkPayload) => {
        const spaceState = $getSelectionPrevNextState();
        const nodes = [];
        if (!spaceState.prevTextIsSpace && !spaceState.startPointIsFirst) {
          nodes.push(new TextNode(' '));
        }
        nodes.push(
          $createLinkNode(payload.url, {
            target: '_blank',
            rel: 'noopener noreferrer',
            title: payload.text,
            ...payload.attributes
          }).append($createTextNode(payload.text))
        );
        if (!spaceState.nextTextIsSpace) {
          nodes.push(new TextNode(' '));
        }
        $insertNodes(nodes);
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  return null;
};
