import React from 'react';
import clsx from 'clsx';
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

/** 菜单容器：既可按 items 配置渲染，也可直接传入 children */
export const List: React.FC<ListProps> = ({ children, items, className }) => {
  return (
    <ul className={clsx('theme__menu', className)} role="listbox">
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
