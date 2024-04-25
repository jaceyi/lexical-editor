import PropTypes from 'prop-types';
import * as sources from './icons';

export const Icon = ({ type }) => {
  const source = sources[type];
  if (!source) {
    console.error(`Unknown icon type: ${type}`);
  }

  return <img src={source} alt={type} />;
};

Icon.propTypes = {
  type: PropTypes.string
};
