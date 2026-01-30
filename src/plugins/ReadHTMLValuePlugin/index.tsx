import React, { useEffect, useRef } from 'react';
import { $insertNodes, $getRoot, $createParagraphNode, SKIP_DOM_SELECTION_TAG } from 'lexical';
import { $generateNodesFromDOM } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

export interface ReadHTMLValuePluginProps {
  initialValue?: string;
  value?: string;
}

export const ReadHTMLValuePlugin: React.FC<ReadHTMLValuePluginProps> = ({
  initialValue,
  value
}) => {
  const [editor] = useLexicalComposerContext();

  const isMountRef = useRef(false);
  useEffect(() => {
    let html = '';
    if (isMountRef.current) {
      html = value ?? '';
    } else {
      html = value ?? initialValue ?? '';
    }

    editor.update(
      () => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(html, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);

        if (nodes.length) {
          $getRoot().clear().select();
          $insertNodes(nodes);
        } else {
          $getRoot().clear().select();
          $insertNodes([$createParagraphNode()]);
        }
      },
      {
        tag: [SKIP_DOM_SELECTION_TAG]
      }
    );

    isMountRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return null;
};
