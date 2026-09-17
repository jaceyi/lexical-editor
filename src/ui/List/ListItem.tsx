import React from 'react';
import clsx from 'clsx';

export interface ListItemProps extends React.HTMLAttributes<HTMLLIElement> {
  children: React.ReactNode;
  isSelected?: boolean;
  className?: string;
}

/** 菜单列表项：用于下拉菜单、提及候选等列表 */
export const ListItem: React.FC<ListItemProps> = ({
  children,
  isSelected,
  className,
  ...restProps
}) => {
  return (
    <li
      className={clsx('theme__menuItem', className, {
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
