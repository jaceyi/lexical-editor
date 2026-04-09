import React from 'react';
import type { IconComponentType } from '.';

const ClearStyleOutlined: IconComponentType = props => {
  return (
    <svg
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      {...props}
    >
      <path
        d="M630.016 43.2a64 64 0 0 0-90.432 3.968L107.2 519.04a64 64 0 0 0 3.968 90.432l119.744 109.696a64 64 0 0 0 43.264 16.832H574.72a64 64 0 0 0 47.168-20.736l295.168-322.176a64 64 0 0 0-3.904-90.432L630.016 43.2zM280.384 656L177.024 561.28l230.784-251.84 261.632 235.52-101.76 111.04H280.32z"
        fill="currentColor"
      />
      <path d="M96 832h832v96h-832V832z" fill="currentColor" />
    </svg>
  );
};

export default ClearStyleOutlined;
