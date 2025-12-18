import React from 'react';
import type { IconComponentType } from '.';

const AlignLeftOutlined: IconComponentType = props => {
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
        d="M96 128h832v96H96zM96 576h832v96H96zM96 352h576v96H96zM96 800h576v96H96z"
        fill="currentColor"
      />
    </svg>
  );
};

export default AlignLeftOutlined;
