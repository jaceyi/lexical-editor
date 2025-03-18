import React from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_LINK_COMMAND } from '../../src/plugins/LinkPlugin';

export const CustomePlugin = () => {
  const [editor] = useLexicalComposerContext();

  const insertLink = () => {
    editor.dispatchCommand(INSERT_LINK_COMMAND, {
      url: 'https://google.com',
      text: "Google"
    });
  };

  return <button onClick={insertLink}>插入链接</button>;
};
