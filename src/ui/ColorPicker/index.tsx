import React, { useCallback, useMemo, useState } from 'react';
import Dropdown, { DropdownProps } from 'rc-dropdown';
import classNames from 'classnames';

export interface ColorPickerProps extends DropdownProps {
  value?: string | null;
  onChange: (color: string | null) => void;
  colors?: string[][];
  overlayClassName?: string;
}

const defaultColorMatrix: string[][] = [
  [
    '#000000',
    '#262626',
    '#595959',
    '#8c8c8c',
    '#bfbfbf',
    '#d9d9d9',
    '#f0f0f0',
    '#f5f5f5',
    '#fafafa',
    '#ffffff'
  ],
  [
    '#f5222d',
    '#fa8c16',
    '#fadb14',
    '#52c41a',
    '#13c2c2',
    '#1890ff',
    '#2f54eb',
    '#722ed1',
    '#eb2f96',
    '#fa541c'
  ],
  [
    '#ff4d4f',
    '#ffa940',
    '#ffec3d',
    '#73d13d',
    '#36cfc9',
    '#69c0ff',
    '#597ef7',
    '#9254de',
    '#f759ab',
    '#ff7a45'
  ],
  [
    '#ffccc7',
    '#ffe7ba',
    '#fff566',
    '#95de64',
    '#87e8de',
    '#bae7ff',
    '#adc6ff',
    '#d3adf7',
    '#ffadd2',
    '#ffd591'
  ],
  [
    '#cf1322',
    '#d46b08',
    '#d4b106',
    '#389e0d',
    '#08979c',
    '#1d39c4',
    '#10239e',
    '#531dab',
    '#c41d7f',
    '#d4380d'
  ],
  [
    '#a8071a',
    '#ad4e00',
    '#ad8b00',
    '#237804',
    '#006d75',
    '#003eb3',
    '#061178',
    '#391085',
    '#9e1068',
    '#ad2102'
  ],
  [
    '#820014',
    '#873800',
    '#614700',
    '#135200',
    '#00474f',
    '#002766',
    '#030852',
    '#22075e',
    '#780650',
    '#872400'
  ],
  [
    '#5c0011',
    '#612500',
    '#443500',
    '#092b00',
    '#002329',
    '#001529',
    '#020f4d',
    '#120338',
    '#520339',
    '#611a00'
  ]
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  colors = defaultColorMatrix,
  overlayClassName,
  placement = 'bottomLeft',
  ...restProps
}) => {
  const [open, setOpen] = useState(false);

  /**
   * 控制下拉框显隐。
   * @param nextOpen 是否展示
   * @returns void
   */
  const handleVisibleChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
  }, []);

  /**
   * 处理颜色选择，空值代表清除。
   * @param color 颜色 hex 或 null
   * @returns void
   */
  const handleSelect = useCallback(
    (color: string | null) => {
      onChange(color);
      setOpen(false);
    },
    [onChange]
  );

  const overlayContent = useMemo(
    () => (
      <div
        className="editor__colorDropdown"
        onClick={e => e.stopPropagation()}
        onMouseDown={e => e.preventDefault()}
        onMouseUp={e => e.preventDefault()}
      >
        <div className="editor__colorClear" onClick={() => handleSelect(null)}>
          <span className="editor__colorClearIcon" />
          <span className="editor__colorClearText">清除颜色</span>
        </div>
        <div className="editor__colorGrid">
          {colors.map((row, rowIndex) => (
            <div className="editor__colorRow" key={`row-${rowIndex}`}>
              {row.map(color => (
                <button
                  key={`${rowIndex}-${color}`}
                  type="button"
                  className={classNames('editor__colorBlock', {
                    editor__colorBlockSelected: color === value
                  })}
                  style={{ backgroundColor: color }}
                  onClick={() => handleSelect(color)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    ),
    [colors, handleSelect, value]
  );

  return (
    <Dropdown
      trigger={['click']}
      overlay={overlayContent}
      overlayClassName={classNames('editor__root', overlayClassName)}
      placement={placement}
      visible={open}
      onVisibleChange={handleVisibleChange}
      autoDestroy
      {...restProps}
    />
  );
};
