import React from 'react';
import clsx from 'clsx';
import Tooltip from '@rc-component/tooltip';

/** 工具栏按钮之间的分隔线 */
export const ToolbarDivider: React.FC = () => {
  return <div className="editor__toolbarDivider" />;
};

export interface ToolbarItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  isDisabled?: boolean;
}

/** 工具栏按钮：带激活/禁用态，title 以气泡形式展示 */
export const ToolbarItem = React.forwardRef<HTMLButtonElement, ToolbarItemProps>(
  ({ isActive, isDisabled, className, children, title, ...props }, ref) => {
    return (
      <Tooltip placement="bottom" overlay={title}>
        <button
          ref={ref}
          className={clsx('editor__toolbarItem', className, {
            editor__toolbarItem_actived: isActive,
            editor__toolbarItem_disabled: isDisabled
          })}
          disabled={isDisabled}
          {...props}
        >
          {children}
        </button>
      </Tooltip>
    );
  }
);

ToolbarItem.displayName = 'ToolbarItem';
