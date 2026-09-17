import React from 'react';
import type { IconComponentType } from '.';

const CloseOutlined: IconComponentType = props => {
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
        d="M601.5 516.1l345.9-344.6c16.2-24.3 16.2-64.8 0-89.2-24.4-24.3-65.1-24.3-89.5 0L512 426.9 166.2 82.3c-24.4-24.3-65.1-24.3-89.5 0-16.3 24.3-16.3 64.9 0 89.2l345.8 344.6L84.8 852.5c-24.4 24.3-24.4 64.8 0 89.2 24.4 24.4 65.1 24.4 89.5 0L512 605.3l337.7 336.5c24.4 24.4 65.1 24.4 89.5 0 24.4-24.3 24.4-64.8 0-89.2L601.5 516.1z"
        fill="currentColor"
      />
    </svg>
  );
};

export default CloseOutlined;
