import React, { useEffect, useRef } from 'react';
import { $selectAll, $insertNodes, $getRoot } from 'lexical';
import { $generateNodesFromDOM } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { SKIP_SCROLL_INTO_VIEW_TAG } from 'lexical';
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

    let isFocused = false;
    editor.update(
      () => {
        const rootElement = editor.getRootElement();
        isFocused = document.activeElement === rootElement;
        const parser = new DOMParser();
        const dom = parser.parseFromString(html, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        if (nodes.length) {
          $selectAll();
          $insertNodes(nodes);
        } else {
          const root = $getRoot();
          root.clear(); // 清空编辑器内容
          $insertNodes([]); // 防止编辑器内容为空时的报错
        }
      },
      {
        onUpdate: () => {
          if (editor.isEditable()) {
            if (isFocused) {
              editor.focus();
            } else {
              editor.blur();
            }
          }
        },
        tag: [SKIP_SCROLL_INTO_VIEW_TAG]
      }
    );

    isMountRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return null;
};
