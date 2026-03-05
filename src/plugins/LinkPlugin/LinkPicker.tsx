import React, { useState, useCallback } from 'react';
import Dropdown from 'rc-dropdown';
import { LinkOutlined, ExpandOutlined } from '../../icons';
import { ToolbarItem } from '../../ui';
import { LinkEditor } from './LinkEditor';

interface LinkPickerProps {
  linkUrl: string | null;
}

export const LinkPicker: React.FC<LinkPickerProps> = ({ linkUrl }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleVisibleChange = useCallback((visible: boolean) => {
    setIsOpen(visible);
  }, []);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <Dropdown
      overlayClassName="editor__root"
      trigger={['click']}
      visible={isOpen}
      onVisibleChange={handleVisibleChange}
      overlay={<LinkEditor linkUrl={linkUrl} onConfirm={closeDropdown} onCancel={closeDropdown} />}
    >
      <ToolbarItem title="超链接" isActive={isOpen || linkUrl !== null}>
        <LinkOutlined className="theme__icon" />
        <ExpandOutlined className="theme__iconExpand" />
      </ToolbarItem>
    </Dropdown>
  );
};
