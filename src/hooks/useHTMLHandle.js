import { useState, useMemo } from 'react';

export const useHTMLHandle = ({ initialValue }) => {
  const [{ inputValue, forceKey }, setInputState] = useState({
    inputValue: initialValue,
    forceKey: 0
  });
  const [outputValue, setOutputValue] = useState(initialValue);

  return [
    useMemo(
      () => ({
        value: outputValue,
        onChange: value => {
          setInputState(({ forceKey }) => ({
            inputValue: value,
            forceKey: forceKey + 1
          }));
        }
      }),
      [outputValue, setInputState]
    ),
    useMemo(
      () => ({
        initialValue,
        value: inputValue,
        onChange: setOutputValue,
        forceUpdateValueKey: forceKey
      }),
      [forceKey, inputValue, setOutputValue]
    )
  ];
};
