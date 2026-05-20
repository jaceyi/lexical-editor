import React from 'react';
import Dropdown, { DropdownProps } from '@rc-component/dropdown';
import { $patchStyleText } from '@lexical/selection';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection } from 'lexical';
import { ExpandOutlined, FontFamilyOutlined } from '../../icons';
import { List, ToolbarItem } from '../../ui';
import { usePopupContainer } from '../../hooks/usePopupContainer';
import { useLocale } from '../../locale';

export interface FontFamily {
  label: string;
  value: string | null;
}

export interface DropdownFontFamilyProps extends Omit<DropdownProps, 'children'> {
  fontFamily: string | null;
}

/**
 * 字体下拉选择组件
 * @param fontFamily 当前选中的字体族值
 */
export const DropdownFontFamily: React.FC<DropdownFontFamilyProps> = ({ fontFamily }) => {
  const [editor] = useLexicalComposerContext();
  const { getPopupContainer } = usePopupContainer();
  const locale = useLocale();

  const fontFamilies: FontFamily[] = [
    { label: locale.fontDefault, value: null },
    {
      label: locale.fontSimHei,
      value: '"PingFang SC", "Microsoft YaHei", "Source Han Sans SC", sans-serif'
    },
    { label: locale.fontSimSun, value: '"Songti SC", "SimSun", "STSong", serif' },
    { label: locale.fontKaiTi, value: '"Kaiti SC", "KaiTi", "STKaiti", serif' },
    { label: locale.fontYuanTi, value: '"Yuanti SC", "YouYuan", "STYuanti", sans-serif' },
    { label: locale.fontMonospace, value: 'Menlo, Monaco, Consolas, "Courier New", monospace' }
  ];

  const updateFontFamily = (value: string | null) => {
    editor.update(() => {
      const selection = $getSelection();
      if (selection !== null) {
        $patchStyleText(selection, {
          'font-family': value ?? 'inherit'
        });
      }
    });
  };

  const activeItem = fontFamilies.find(item => item.value === fontFamily) ?? fontFamilies[0];

  const menuItems = fontFamilies.map(item => ({
    key: item.label,
    label: (
      <div className="theme__menuItemLabel">
        <span style={{ fontFamily: item.value ?? 'inherit' }}>{item.label}</span>
      </div>
    ),
    isSelected: item.value === fontFamily,
    onClick: () => updateFontFamily(item.value)
  }));

  return (
    <Dropdown
      getPopupContainer={getPopupContainer}
      overlay={<List items={menuItems} />}
      trigger={['click']}
    >
      <ToolbarItem title={locale.fontFamily}>
        <FontFamilyOutlined className="theme__icon" />
        <span className="editor__toolbarFontFamilyLabel">{activeItem.label}</span>
        <ExpandOutlined className="theme__iconExpand" />
      </ToolbarItem>
    </Dropdown>
  );
};
