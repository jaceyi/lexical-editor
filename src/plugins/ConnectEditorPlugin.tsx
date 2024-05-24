import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import React, { cloneElement, isValidElement } from 'react';

export interface ConnectEditorPluginProps {
  plugins: React.FunctionComponentElement<{ [key: string]: any }>[];
}

export const ConnectEditorPlugin: React.FC<ConnectEditorPluginProps> = ({
  plugins
}) => {
  const [editor] = useLexicalComposerContext();

  if (Array.isArray(plugins)) {
    return plugins.map(plugin => {
      if (isValidElement(plugin)) {
        return cloneElement(plugin, {
          ...plugin.props,
          editor
        });
      }
      return null;
    });
  }
  return null;
};
