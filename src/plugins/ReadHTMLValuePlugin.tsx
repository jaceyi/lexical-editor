import React, { useEffect, useCallback } from 'react';
import { $selectAll, $getSelection, $insertNodes } from 'lexical';
import { $generateNodesFromDOM } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

export interface ReadHTMLValuePluginProps {
  initialValue?: string;
  value?: string | null;
  forceUpdateValueKey?: string | number;
}

export const ReadHTMLValuePlugin: React.FC<ReadHTMLValuePluginProps> = ({
  initialValue = '',
  value,
  forceUpdateValueKey
}) => {
  const [editor] = useLexicalComposerContext();

  const insertHTML = useCallback((html: string) => {
    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(html, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);

      $selectAll();
      $getSelection();
      $insertNodes(nodes);
    });
  }, []);

  useEffect(() => {
    if (typeof value !== 'string') {
      insertHTML(initialValue);
    }
  }, []);

  useEffect(() => {
    if (typeof value === 'string') {
      insertHTML(value);
    }
  }, [insertHTML, value, forceUpdateValueKey]);

  return null;
};
