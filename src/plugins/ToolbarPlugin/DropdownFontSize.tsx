import React from 'react';
import Dropdown, { DropdownProps } from '@rc-component/dropdown';
import { $patchStyleText } from '@lexical/selection';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection } from 'lexical';
import { ExpandOutlined, FontSizeOutlined } from '../../icons';
import { List, ToolbarItem } from '../../ui';
import { usePopupContainer } from '../../hooks/usePopupContainer';
import { useLocale } from '../../locale';

const fontSizes = [12, 13, 14, 16, 18, 20, 24, 32, 40, 48];

/** 工具栏字号标签：纯数字补上 px 单位，其他单位（em、rem、%）原样展示；未设置返回 null */
export const getFontSizeLabel = (fontSize: string | null): string | null =>
  !fontSize ? null : /^\d+(\.\d+)?$/.test(fontSize) ? `${fontSize}px` : fontSize;

export interface DropdownFontSizeProps extends Omit<DropdownProps, 'children'> {
  fontSize: string | null;
}

/** 字体大小下拉：工具栏上显示当前字号，与字体下拉保持一致 */
export const DropdownFontSize: React.FC<DropdownFontSizeProps> = ({ fontSize }) => {
  const [editor] = useLexicalComposerContext();
  const { getPopupContainer } = usePopupContainer();
  const locale = useLocale();

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

  // 工具栏上展示当前字号；未设置或选区字号不统一时显示「默认」
  const fontSizeLabel = getFontSizeLabel(fontSize) ?? locale.fontDefault;

  const menuItems = [
    {
      key: 'default',
      label: (
        <div className="theme__menuItemLabel">
          <span>{locale.fontDefault}</span>
        </div>
      ),
      isSelected: !fontSize,
      onClick: () => updateFontSize(null)
    },
    ...fontSizes.map(item => ({
      key: String(item),
      label: (
        <div className="theme__menuItemLabel">
          <span>{`${item}px`}</span>
        </div>
      ),
      isSelected: `${item}px` === fontSize,
      onClick: () => updateFontSize(`${item}px`)
    }))
  ];

  return (
    <Dropdown
      getPopupContainer={getPopupContainer}
      overlay={<List items={menuItems} />}
      trigger={['click']}
    >
      <ToolbarItem title={locale.fontSize}>
        <FontSizeOutlined className="theme__icon" />
        <span className="editor__toolbarFontSizeLabel">{fontSizeLabel}</span>
        <ExpandOutlined className="theme__iconExpand" />
      </ToolbarItem>
    </Dropdown>
  );
};
