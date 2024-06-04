import React from 'react';
import { $generateHtmlFromNodes } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

export interface CustomePluginProps {
  type: string;
}

export const CustomePlugin: React.FC<CustomePluginProps> = ({ type }) => {
  const [editor] = useLexicalComposerContext();

  editor.update(() => {
    const html = $generateHtmlFromNodes(editor, null);
    console.log(type, html);
  });

  return null;
};
