import React from 'react';
import Dropdown, { DropdownProps } from 'rc-dropdown';
import { HeadingTagType } from '@lexical/rich-text';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, $createParagraphNode, LexicalCommand } from 'lexical';
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND
} from '@lexical/list';
import { $setBlocksType } from '@lexical/selection';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import {
  TextNormalOutlined,
  Heading1Outlined,
  Heading2Outlined,
  Heading3Outlined,
  QuoteBlockOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  ExpandOutlined
} from '../../icons';
import { List, ToolbarItem } from '../../ui';

export interface DropdownBlockFormatProps extends Omit<DropdownProps, 'children'> {
  blockType: string;
}

/**
 * 块格式化下拉选择组件
 * 方法出入参数：
 * @param blockType 当前选中的块类型
 * 方法核心逻辑：渲染一个下拉菜单，包含各种文本块格式化选项（标题、列表、引用等）
 */
export const DropdownBlockFormat: React.FC<DropdownBlockFormatProps> = ({ blockType }) => {
  const [editor] = useLexicalComposerContext();

  /**
   * 格式化为正文
   */
  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  /**
   * 格式化为标题
   * @param headingSize 标题等级
   */
  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        $setBlocksType(selection, () => $createHeadingNode(headingSize));
      });
    }
  };

  /**
   * 格式化为列表
   * @param command Lexical 指令
   * @param type 列表类型
   */
  const formatOrderedList = (command: LexicalCommand<unknown>, type: 'number' | 'bullet') => {
    if (blockType !== type) {
      editor.dispatchCommand(command, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  /**
   * 格式化为引用块
   */
  const formatQuote = () => {
    if (blockType !== 'quote') {
      editor.update(() => {
        const selection = $getSelection();
        $setBlocksType(selection, () => $createQuoteNode());
      });
    }
  };

  /**
   * 列表项配置数组
   */
  const menuItems = [
    {
      key: 'paragraph',
      label: (
        <div className="theme__menuItemLabel">
          <TextNormalOutlined className="theme__icon" />
          <span>正文</span>
        </div>
      ),
      onClick: formatParagraph
    },
    {
      key: 'h1',
      label: (
        <div className="theme__menuItemLabel">
          <Heading1Outlined className="theme__icon" />
          <span>标题 1</span>
        </div>
      ),
      onClick: () => formatHeading('h1')
    },
    {
      key: 'h2',
      label: (
        <div className="theme__menuItemLabel">
          <Heading2Outlined className="theme__icon" />
          <span>标题 2</span>
        </div>
      ),
      onClick: () => formatHeading('h2')
    },
    {
      key: 'h3',
      label: (
        <div className="theme__menuItemLabel">
          <Heading3Outlined className="theme__icon" />
          <span>标题 3</span>
        </div>
      ),
      onClick: () => formatHeading('h3')
    },
    {
      key: 'number',
      label: (
        <div className="theme__menuItemLabel">
          <OrderedListOutlined className="theme__icon" />
          <span>有序列表</span>
        </div>
      ),
      onClick: () => formatOrderedList(INSERT_ORDERED_LIST_COMMAND, 'number')
    },
    {
      key: 'bullet',
      label: (
        <div className="theme__menuItemLabel">
          <UnorderedListOutlined className="theme__icon" />
          <span>无序列表</span>
        </div>
      ),
      onClick: () => formatOrderedList(INSERT_UNORDERED_LIST_COMMAND, 'bullet')
    },
    {
      key: 'quote',
      label: (
        <div className="theme__menuItemLabel">
          <QuoteBlockOutlined className="theme__icon" />
          <span>引用块</span>
        </div>
      ),
      onClick: formatQuote
    }
  ].map(item => ({
    ...item,
    isSelected: item.key === blockType
  }));

  const activeMenuItem = menuItems.find(item => item.key === blockType);

  return (
    <Dropdown
      overlayClassName="editor__root"
      overlay={<List items={menuItems} />}
      trigger={['click']}
    >
      <ToolbarItem className="blockFormat">
        {activeMenuItem?.label}
        <ExpandOutlined className="theme__iconExpand" />
      </ToolbarItem>
    </Dropdown>
  );
};
