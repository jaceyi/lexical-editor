import React from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_LINK_COMMAND } from '../../src/plugins/LinkPlugin';

export const CustomePlugin = () => {
  const [editor] = useLexicalComposerContext();

  const insertLink = () => {
    editor.dispatchCommand(INSERT_LINK_COMMAND, {
      url: 'https://jaceyi.com',
      text: "Jace's Blog"
    });
  };

  return <button onClick={insertLink}>插入链接</button>;
};
