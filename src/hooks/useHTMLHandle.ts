import { useState, useMemo } from 'react';

export const useHTMLHandle = ({ initialValue = '' }) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const [outputValue, setOutputValue] = useState(initialValue);

  /**
   * 外部组件使用的 Props
   */
  const outputProps = useMemo(
    () => ({
      /**
       * 编辑器值发生变化会同步至此值
       */
      value: outputValue,

      /**
       * 调用此方法可以设置编辑器值
       */
      onChange: setInputValue
    }),
    [outputValue, setInputValue]
  );

  /**
   * 编辑器使用的 Props
   * 将此 Props 透传给编辑器组件即可
   */
  const editorProps = useMemo(
    () => ({
      initialValue,
      value: inputValue,
      onChange: setOutputValue
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inputValue, setOutputValue]
  );

  return [outputProps, editorProps] as [typeof outputProps, typeof editorProps];
};
