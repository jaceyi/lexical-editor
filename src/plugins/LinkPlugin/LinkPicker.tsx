import React, { useState, useCallback } from 'react';
import Dropdown from 'rc-dropdown';
import { LinkOutlined, ExpandOutlined } from '../../icons';
import { ToolbarItem } from '../../ui';
import { LinkEditor } from './LinkEditor';

interface LinkPickerProps {
  linkData: {
    isLink: boolean;
    url: string | null;
  };
}

export const LinkPicker: React.FC<LinkPickerProps> = ({ linkData }) => {
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
      overlay={
        <LinkEditor linkData={linkData} onConfirm={closeDropdown} onCancel={closeDropdown} />
      }
    >
      <ToolbarItem title="链接" isActive={isOpen || linkData.isLink}>
        <LinkOutlined className="theme__icon" />
        <ExpandOutlined className="theme__iconExpand" />
      </ToolbarItem>
    </Dropdown>
  );
};
