import React, { useState, useCallback } from 'react';
import Dropdown from '@rc-component/dropdown';
import { LinkOutlined, ExpandOutlined } from '../../icons';
import { ToolbarItem } from '../../ui';
import { LinkEditor } from './LinkEditor';
import { usePopupContainer } from '../../hooks/usePopupContainer';
import { useLocale } from '../../locale';

interface LinkPickerProps {
  linkUrl: string | null;
}

export const LinkPicker: React.FC<LinkPickerProps> = ({ linkUrl }) => {
  const { getPopupContainer } = usePopupContainer();
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  const handleVisibleChange = useCallback((visible: boolean) => {
    setIsOpen(visible);
  }, []);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <Dropdown
      getPopupContainer={getPopupContainer}
      trigger={['click']}
      visible={isOpen}
      onVisibleChange={handleVisibleChange}
      overlay={<LinkEditor linkUrl={linkUrl} onConfirm={closeDropdown} onCancel={closeDropdown} />}
    >
      <ToolbarItem title={locale.hyperlink} isActive={isOpen || linkUrl !== null}>
        <LinkOutlined className="theme__icon" />
        <ExpandOutlined className="theme__iconExpand" />
      </ToolbarItem>
    </Dropdown>
  );
};
