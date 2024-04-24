import './style.scss';
import React from 'react';
import { BeautifulMentionsPlugin } from 'lexical-beautiful-mentions';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export const mentionsPluginTheme = {
  '@': {
    container: 'theme__mentionAt',
    containerFocused: 'theme__mentionFocused'
  }
};

export const MentionsPlugin = ({ mentions }) => {
  return (
    <BeautifulMentionsPlugin
      triggers={['@']}
      items={{
        '@': mentions
      }}
      menuComponent={CustomMenu}
      menuItemComponent={CustomMenuItem}
    />
  );
};

MentionsPlugin.propTypes = {
  mentions: PropTypes.array.isRequired
};

// eslint-disable-next-line no-unused-vars
const CustomMenu = React.forwardRef(({ loading, ...props }, ref) => {
  return <ul className="editor__mentionsMenu" {...props} ref={ref} />;
});

CustomMenu.propTypes = {
  loading: PropTypes.bool
};

const CustomMenuItem = React.forwardRef(
  // eslint-disable-next-line no-unused-vars
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
CustomMenuItem.propTypes = {
  selected: PropTypes.bool,
  itemValue: PropTypes.string
};
