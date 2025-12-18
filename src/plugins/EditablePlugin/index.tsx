import React, { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

export interface EditablePluginProps {
  isEditable: boolean;
}

/**
 * 插件：动态设置编辑器的可编辑状态
 * 方法出入参数：
 * @param isEditable 是否可编辑
 */
export const EditablePlugin: React.FC<EditablePluginProps> = ({ isEditable }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // 动态同步编辑器的 editable 状态
    editor.setEditable(!!isEditable);
  }, [editor, isEditable]);

  return null;
};
