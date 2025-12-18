import React from 'react';
import classNames from 'classnames';

/**
 * 工具栏分隔线组件
 */
export const ToolbarDivider: React.FC = () => {
  return <div className="editor__toolbarDivider" />;
};

export interface ToolbarItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  isDisabled?: boolean;
}

/**
 * 工具栏按钮项组件
 * 方法出入参数：
 * @param isActive 是否处于激活状态
 * @param isDisabled 是否处于禁用状态
 * @param className 额外的样式类名
 * @param children 按钮内容
 */
export const ToolbarItem = React.forwardRef<HTMLButtonElement, ToolbarItemProps>(
  ({ isActive, isDisabled, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={classNames('editor__toolbarItem', className, {
          editor__toolbarItem_actived: isActive,
          editor__toolbarItem_disabled: isDisabled
        })}
        disabled={isDisabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

ToolbarItem.displayName = 'ToolbarItem';
