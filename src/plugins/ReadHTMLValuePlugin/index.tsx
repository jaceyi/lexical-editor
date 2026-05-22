import React, { useEffect, useRef } from 'react';
import {
  $insertNodes,
  $getRoot,
  $createParagraphNode,
  HISTORY_MERGE_TAG,
  SKIP_DOM_SELECTION_TAG
} from 'lexical';
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
        tag: [SKIP_DOM_SELECTION_TAG],
        onUpdate() {
          // 外部 value 更新后，将所有文本节点标记为 dirty 以触发自定义文本节点（如 KeywordNode）的运行时转换
          editor.update(
            () => {
              const root = $getRoot();
              root.getAllTextNodes().forEach(node => {
                node.markDirty();
              });
            },
            {
              tag: [HISTORY_MERGE_TAG, SKIP_DOM_SELECTION_TAG]
            }
          );
        }
      }
    );

    isMountRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return null;
};
