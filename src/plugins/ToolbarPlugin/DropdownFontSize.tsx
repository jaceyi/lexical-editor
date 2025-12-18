import React from 'react';
import Dropdown, { DropdownProps } from 'rc-dropdown';
import { $patchStyleText } from '@lexical/selection';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection } from 'lexical';
import { ExpandOutlined, FontSizeOutlined } from '../../icons';
import { List, ToolbarItem } from '../../ui';

const fontSizes = [12, 13, 14, 16, 18, 20, 24, 32, 40, 48];

export interface DropdownFontSizeProps extends Omit<DropdownProps, 'children'> {
  fontSize: string | null;
}

/**
 * 字体大小下拉选择组件
 * 方法出入参数：
 * @param fontSize 当前选中的字体大小
 * 方法核心逻辑：渲染一个下拉菜单，包含预设的字体大小选项
 */
export const DropdownFontSize: React.FC<DropdownFontSizeProps> = ({ fontSize }) => {
  const [editor] = useLexicalComposerContext();

  /**
   * 更新字体大小
   * @param size 选中的字体大小（带单位）
   */
  const updateFontSize = (size: string | null) => {
    editor.update(() => {
      const selection = $getSelection();
      if (selection !== null) {
        $patchStyleText(selection, {
          'font-size': size
        });
      }
    });
  };

  /**
   * 列表项配置数组
   */
  const menuItems = fontSizes.map(item => ({
    key: String(item),
    label: (
      <div className="theme__menuItemLabel">
        <span>{`${item} px`}</span>
      </div>
    ),
    isSelected: `${item}px` === fontSize,
    onClick: () => updateFontSize(`${item}px`)
  }));

  return (
    <Dropdown
      overlayClassName="editor__root"
      overlay={<List items={menuItems} />}
      trigger={['click']}
    >
      <ToolbarItem>
        <FontSizeOutlined className="theme__icon" />
        <ExpandOutlined className="theme__iconExpand" />
      </ToolbarItem>
    </Dropdown>
  );
};
