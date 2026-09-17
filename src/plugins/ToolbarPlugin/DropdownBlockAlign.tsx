import React from 'react';
import Dropdown, { DropdownProps } from '@rc-component/dropdown';
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
import { usePopupContainer } from '../../hooks/usePopupContainer';
import { useLocale } from '../../locale';

export interface DropdownBlockAlignProps extends Omit<DropdownProps, 'children'> {
  elementFormat: string;
}

/** 块对齐方式下拉：左对齐、居中、右对齐、两端对齐 */
export const DropdownBlockAlign: React.FC<DropdownBlockAlignProps> = ({ elementFormat }) => {
  const [editor] = useLexicalComposerContext();
  const { getPopupContainer } = usePopupContainer();
  const locale = useLocale();

  const menuItems = [
    {
      key: 'left',
      label: (
        <div className="theme__menuItemLabel">
          <AlignLeftOutlined className="theme__icon" />
          <span>{locale.alignLeft}</span>
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
          <span>{locale.alignCenter}</span>
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
          <span>{locale.alignRight}</span>
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
          <span>{locale.alignJustify}</span>
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
      getPopupContainer={getPopupContainer}
      overlay={<List items={menuItems} />}
      trigger={['click']}
    >
      <ToolbarItem title={locale.alignment} className="blockFormat">
        {activeMenuItem?.label}
        <ExpandOutlined className="theme__iconExpand" />
      </ToolbarItem>
    </Dropdown>
  );
};
