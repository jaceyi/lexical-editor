import React from 'react';
import classNames from 'classnames';

export interface ListItemProps extends React.HTMLAttributes<HTMLLIElement> {
  children: React.ReactNode;
  isSelected?: boolean;
  className?: string;
}

/**
 * 通用列表项组件：用于编辑器内部的各种下拉列表、弹出菜单
 * 方法出入参数：
 * @param children 子内容
 * @param isSelected 当前是否被选中（高亮）
 * @param activeClassName 选中时的样式类名
 */
export const ListItem: React.FC<ListItemProps> = ({
  children,
  isSelected,
  className,
  ...restProps
}) => {
  return (
    <li
      className={classNames('theme__menuItem', className, {
        theme__menuItemSelected: isSelected
      })}
      role="option"
      aria-selected={isSelected}
      {...restProps}
    >
      {children}
    </li>
  );
};
