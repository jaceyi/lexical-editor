import React from 'react';
import {
  BeautifulMentionsPlugin,
  BeautifulMentionsItem,
  BeautifulMentionsMenuProps,
  BeautifulMentionsMenuItemProps
} from 'lexical-beautiful-mentions';
import classNames from 'classnames';

export const mentionsPluginTheme = {
  '@': {
    container: 'theme__mentionAt',
    containerFocused: 'theme__mentionFocused'
  }
};

export interface MentionsPluginProps {
  mentions?: BeautifulMentionsItem[];
}
export const MentionsPlugin: React.FC<MentionsPluginProps> = ({
  mentions = []
}) => {
  return (
    <BeautifulMentionsPlugin
      triggers={['@']}
      items={{
        '@': mentions
      }}
      insertOnBlur={false}
      menuComponent={CustomMenu}
      menuItemComponent={CustomMenuItem}
    />
  );
};

const CustomMenu = React.forwardRef<null, BeautifulMentionsMenuProps>(
  ({ loading, ...props }, ref) => {
    return <ul className="editor__mentionsMenu" {...props} ref={ref} />;
  }
);

const CustomMenuItem = React.forwardRef<null, BeautifulMentionsMenuItemProps>(
  ({ selected, itemValue, ...props }, ref) => {
    return (
      <li
        className={classNames('editor__mentionsMenuItem', { selected })}
        {...props}
        ref={ref}
      />
    );
  }
);
