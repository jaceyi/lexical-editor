import { useEffect } from 'react';
import {
  $createTextNode,
  $getPreviousSelection,
  $getSelection,
  $insertNodes,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  createCommand,
  TextNode
} from 'lexical';
import { $createLinkNode, $toggleLink, TOGGLE_LINK_COMMAND, LinkAttributes } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelectionPrevNextState } from '../../utils/lexical';

interface LinkPayload {
  url: string;
  title?: string;
  attributes?: LinkAttributes;
}

export const INSERT_LINK_COMMAND = createCommand('INSERT_LINK_COMMAND');

export const AUTO_INSERT_LINK_COMMAND = createCommand('AUTO_INSERT_LINK_COMMAND');

export const LinkPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const unregisterInsert = editor.registerCommand(
      INSERT_LINK_COMMAND,
      (payload: LinkPayload) => {
        const spaceState = $getSelectionPrevNextState();
        const nodes = [];
        if (!spaceState.prevTextIsSpace && !spaceState.startPointIsFirst) {
          nodes.push(new TextNode(' '));
        }
        const title = payload.title ?? payload.url;
        nodes.push(
          $createLinkNode(payload.url, {
            target: '_blank',
            rel: 'noopener noreferrer',
            title
          }).append($createTextNode(title))
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

    const unregisterAutoInsert = editor.registerCommand(
      AUTO_INSERT_LINK_COMMAND,
      (payload: LinkPayload) => {
        const getEffectiveSelection = () => {
          return $getSelection() ?? $getPreviousSelection();
        };

        // 如果用户选中了文字，则直接对选区写入链接
        const selection = getEffectiveSelection();
        if ($isRangeSelection(selection)) {
          const selectedText = selection.getTextContent();
          if (selectedText) {
            const title = payload.title ?? payload.url;
            $toggleLink({
              target: '_blank',
              rel: 'noopener noreferrer',
              url: payload.url,
              title
            });
            return true;
          }
        }

        // 未选中文本，则插入一个新的链接节点（展示文本默认使用 url）
        return editor.dispatchCommand(INSERT_LINK_COMMAND, payload);
      },
      COMMAND_PRIORITY_LOW
    );

    return () => {
      unregisterAutoInsert();
      unregisterInsert();
    };
  }, [editor]);

  return null;
};
