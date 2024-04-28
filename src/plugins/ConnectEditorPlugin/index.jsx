import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { cloneElement, isValidElement } from 'react';
import PropTypes from 'prop-types';

export const ConnectEditorPlugin = ({ plugins = [] }) => {
  const [editor] = useLexicalComposerContext();

  return plugins.map(plugin => {
    if (isValidElement(plugin)) {
      return cloneElement(plugin, {
        ...plugin.props,
        editor
      });
    }
    return null;
  });
};

ConnectEditorPlugin.propTypes = {
  plugins: PropTypes.array
};
