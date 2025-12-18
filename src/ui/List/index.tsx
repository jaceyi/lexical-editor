import React from 'react';
import classNames from 'classnames';
import { ListItem, ListItemProps } from './ListItem';

export interface ListItemOption extends Omit<ListItemProps, 'children'> {
  key: string;
  label: React.ReactNode;
  onClick?: () => void;
}

export interface ListProps {
  children?: React.ReactNode;
  items?: ListItemOption[];
  className?: string;
}

/**
 * 通用列表容器组件：提供统一的菜单容器样式
 * 方法出入参数：
 * @param children 子组件（可选）
 * @param items 列表项配置数组（可选）
 * @param className 额外的样式类名
 * 方法核心逻辑：渲染一个 ul 容器，支持通过 children 或 items 渲染列表项
 */
export const List: React.FC<ListProps> = ({ children, items, className }) => {
  return (
    <ul className={classNames('theme__menu', className)} role="listbox">
      {items
        ? items.map(item => {
            const { key, label, ...rest } = item;
            return (
              <ListItem key={key} {...rest}>
                {label}
              </ListItem>
            );
          })
        : children}
    </ul>
  );
};

export * from './ListItem';
