import { $generateHtmlFromNodes } from '@lexical/html';

/* eslint-disable react/prop-types */
export const CustomePlugin = ({ editor, type }) => {
  editor.update(() => {
    const html = $generateHtmlFromNodes(editor, null);
    console.log(type, html);
  });

  return null;
};
