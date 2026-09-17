import React from 'react';
import type { IconComponentType } from '.';

const DownloadOutlined: IconComponentType = props => {
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
        d="M554.688 128v408.96L704 387.712l60.352 60.352L512 700.352 259.648 448 320 387.648l149.312 149.376V128h85.376zM192 597.312v213.376h640V597.312h85.312V896H106.688V597.312H192z"
        fill="currentColor"
      />
    </svg>
  );
};

export default DownloadOutlined;
