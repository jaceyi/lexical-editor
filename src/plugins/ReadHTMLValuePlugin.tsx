import React, { useEffect, useRef } from 'react';
import { $selectAll, $insertNodes } from 'lexical';
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
    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(html, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);

      $selectAll();
      $insertNodes(nodes);
    });

    isMountRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return null;
};
