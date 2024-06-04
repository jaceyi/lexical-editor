import React from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { MenuOption } from '@lexical/react/LexicalTypeaheadMenuPlugin';
import classNames from 'classnames';

export type MentionsItem = { text: string; value: string | number } | string;

export class MentionOption extends MenuOption {
  name: string;
  trigger: string;
  value?: string | number;

  constructor(item: MentionsItem, trigger: string) {
    if (typeof item === 'object') {
      super(item.text);
      this.name = item.text;
      this.value = item.value;
    } else {
      super(item);
      this.name = item;
    }
    this.trigger = trigger;
  }
}

interface MentionsMenuItemProps {
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  option: MentionOption;
}

export const MentionsMenuItem: React.FC<MentionsMenuItemProps> = ({
  isSelected,
  onClick,
  onMouseEnter,
  option
}) => {
  const [editor] = useLexicalComposerContext();
  const mentionsClasses = editor._config.theme.mentions || {};

  return (
    <li
      key={option.key}
      tabIndex={-1}
      className={classNames(mentionsClasses.menuItem, {
        [mentionsClasses.menuItemSelected]: isSelected
      })}
      ref={option.setRefElement}
      role="option"
      aria-selected={isSelected}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      {option.name}
    </li>
  );
};
