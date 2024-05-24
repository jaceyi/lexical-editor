import { useState, useMemo } from 'react';

export const useHTMLHandle = ({ initialValue = '' }) => {
  const [{ inputValue, forceKey }, setInputState] = useState({
    inputValue: initialValue,
    forceKey: 0 // 强制更新编辑器值的 Key
  });
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
      onChange: (value: string) => {
        setInputState(({ forceKey }) => ({
          inputValue: value,
          forceKey: forceKey + 1
        }));
      }
    }),
    [outputValue, setInputState]
  )

  /**
   * 编辑器使用的 Props
   * 将此 Props 透传给编辑器组件即可
   */
  const editorProps = useMemo(
    () => ({
      initialValue,
      value: inputValue,
      onChange: setOutputValue,
      forceUpdateValueKey: forceKey
    }),
    [forceKey, inputValue, setOutputValue]
  )

  return [
    outputProps,
    editorProps
  ] as [
    typeof outputProps,
    typeof editorProps
  ];
};
