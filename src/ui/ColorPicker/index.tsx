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
  // 现代灰度色系
  [
    '#000000',
    '#1f2937',
    '#374151',
    '#4b5563',
    '#6b7280',
    '#9ca3af',
    '#d1d5db',
    '#e5e7eb',
    '#f3f4f6',
    '#ffffff'
  ],
  // 100（最浅）
  [
    '#ffe4e6',
    '#fee2e2',
    '#ffedd5',
    '#fef3c7',
    '#fef9c3',
    '#ecfccb',
    '#dcfce7',
    '#ccfbf1',
    '#cffafe',
    '#dbeafe'
  ],
  // 200（更浅）
  [
    '#fecdd3',
    '#fecaca',
    '#fed7aa',
    '#fde68a',
    '#fef08a',
    '#d9f99d',
    '#bbf7d0',
    '#99f6e4',
    '#a5f3fc',
    '#bfdbfe'
  ],
  // 300（浅色、适合底色）
  [
    '#fda4af',
    '#fca5a5',
    '#fdba74',
    '#fcd34d',
    '#fde047',
    '#bef264',
    '#86efac',
    '#5eead4',
    '#67e8f9',
    '#93c5fd'
  ],
  // 400（更柔和）
  [
    '#fb7185',
    '#f87171',
    '#fb923c',
    '#fbbf24',
    '#facc15',
    '#a3e635',
    '#4ade80',
    '#2dd4bf',
    '#22d3ee',
    '#60a5fa'
  ],
  // 500（默认推荐）
  [
    '#f43f5e',
    '#ef4444',
    '#f97316',
    '#f59e0b',
    '#eab308',
    '#84cc16',
    '#22c55e',
    '#14b8a6',
    '#06b6d4',
    '#3b82f6'
  ],
  // 600（饱和、清爽）
  [
    '#e11d48',
    '#dc2626',
    '#ea580c',
    '#d97706',
    '#ca8a04',
    '#65a30d',
    '#16a34a',
    '#0d9488',
    '#0891b2',
    '#2563eb'
  ],
  // 700（偏深，适合强调）
  [
    '#be123c',
    '#b91c1c',
    '#c2410c',
    '#b45309',
    '#a16207',
    '#4d7c0f',
    '#15803d',
    '#0f766e',
    '#0e7490',
    '#1d4ed8'
  ],
  // 800（更深）
  [
    '#9f1239',
    '#991b1b',
    '#9a3412',
    '#92400e',
    '#854d0e',
    '#3f6212',
    '#166534',
    '#115e59',
    '#155e75',
    '#1e40af'
  ],
  // 900（最深）
  [
    '#881337',
    '#7f1d1d',
    '#7c2d12',
    '#78350f',
    '#713f12',
    '#365314',
    '#14532d',
    '#134e4a',
    '#164e63',
    '#1e3a8a'
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
