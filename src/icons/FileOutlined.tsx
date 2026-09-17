import React from 'react';
import type { IconComponentType } from '.';

const FileOutlined: IconComponentType = props => {
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
        d="M128 42.666667h529.664L896 281.002667V512h-85.333333V384h-256V128H213.333333v768h298.666667v85.333333H128V42.666667z m512 102.997333V298.666667h153.002667L640 145.664zM853.333333 597.333333v170.666667h170.666667v85.333333h-170.666667v170.666667h-85.333333v-170.666667h-170.666667v-85.333333h170.666667v-170.666667h85.333333z"
        fill="currentColor"
      />
    </svg>
  );
};

export default FileOutlined;
