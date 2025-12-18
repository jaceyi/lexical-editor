import React from 'react';
import Dropdown, { DropdownProps } from 'rc-dropdown';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { FORMAT_ELEMENT_COMMAND } from 'lexical';
import {
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  AlignJustifyOutlined,
  ExpandOutlined
} from '../../icons';
import { List, ToolbarItem } from '../../ui';

export interface DropdownBlockAlignProps extends Omit<DropdownProps, 'children'> {
  elementFormat: string;
}

/**
 * 块对齐方式下拉选择组件
 * 方法出入参数：
 * @param elementFormat 当前选中的对齐方式
 * 方法核心逻辑：渲染一个下拉菜单，包含左对齐、居中、右对齐、两端对齐选项
 */
export const DropdownBlockAlign: React.FC<DropdownBlockAlignProps> = ({ elementFormat }) => {
  const [editor] = useLexicalComposerContext();

  /**
   * 列表项配置数组
   */
  const menuItems = [
    {
      key: 'left',
      label: (
        <div className="theme__menuItemLabel">
          <AlignLeftOutlined className="theme__icon" />
          <span>左对齐</span>
        </div>
      ),
      onClick: () => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
      }
    },
    {
      key: 'center',
      label: (
        <div className="theme__menuItemLabel">
          <AlignCenterOutlined className="theme__icon" />
          <span>居中对齐</span>
        </div>
      ),
      onClick: () => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
      }
    },
    {
      key: 'right',
      label: (
        <div className="theme__menuItemLabel">
          <AlignRightOutlined className="theme__icon" />
          <span>右对齐</span>
        </div>
      ),
      onClick: () => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
      }
    },
    {
      key: 'justify',
      label: (
        <div className="theme__menuItemLabel">
          <AlignJustifyOutlined className="theme__icon" />
          <span>两端对齐</span>
        </div>
      ),
      onClick: () => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
      }
    }
  ].map(item => ({
    ...item,
    isSelected: item.key === elementFormat
  }));

  const activeMenuItem = menuItems.find(item => item.key === elementFormat);

  return (
    <Dropdown
      overlayClassName="editor__root"
      overlay={<List items={menuItems} />}
      trigger={['click']}
    >
      <ToolbarItem className="blockFormat">
        {activeMenuItem?.label}
        <ExpandOutlined className="theme__iconExpand" />
      </ToolbarItem>
    </Dropdown>
  );
};
