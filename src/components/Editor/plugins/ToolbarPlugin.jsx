import { useState, useEffect, useCallback } from 'react';
import {
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  UNDO_COMMAND,
  REDO_COMMAND,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  FORMAT_TEXT_COMMAND
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  mergeRegister,
  $findMatchingParent,
  $getNearestNodeOfType
} from '@lexical/utils';
import {
  UndoOutlined,
  RedoOutlined,
  BoldOutlined,
  ItalicOutlined,
  FileImageOutlined,
  OrderedListOutlined,
  UnorderedListOutlined
} from '@ant-design/icons';
import { Tooltip, message } from 'antd';
import { INSERT_IMAGE_COMMAND } from './ImagePlugin';
import Upload from 'antd/lib/upload/Upload';
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  REMOVE_LIST_COMMAND
} from '@lexical/list';
import classNames from 'classnames';

const classNameMaps = {
  item: 'editor-toolbar-item',
  itemDisabled: 'editor-toolbar-item-disabled',
  itemActived: 'editor-toolbar-item-actived',
  divider: 'editor-toolbar-divider'
};

export const ToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext();

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [blockType, setBlockType] = useState('paragraph');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : $findMatchingParent(anchorNode, e => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      // block format
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);
      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode);
          const type = parentList
            ? parentList.getListType()
            : element.getListType();
          setBlockType(type);
        } else {
          setBlockType(element.getType());
        }
      }

      // text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
    }
  }, [editor]);
  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        payload => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        payload => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [$updateToolbar, editor]);

  const onUpload = async file => {
    if (file.size > 1024 * 1024 * 20) {
      message.warning('文件过大，最大可上传20M的文件。');
      return false;
    }
    if (encodeURI(file.name).length >= 150) {
      message.warning('文件名过长！');
      return false;
    }
    // const [image] = await uploadFileList([file]);
    // image &&
    //   editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
    //     src: image.url,
    //     altText: image.name
    //   });
    return false;
  };

  return (
    <div className="editor-toolbar">
      <Tooltip title="撤销">
        <button
          className={classNames(classNameMaps.item, {
            [classNameMaps.itemDisabled]: !canUndo
          })}
          disabled={!canUndo}
          onClick={() => {
            editor.dispatchCommand(UNDO_COMMAND, undefined);
          }}
        >
          <UndoOutlined />
        </button>
      </Tooltip>
      <Tooltip title="重做">
        <button
          className={classNames(classNameMaps.item, {
            [classNameMaps.itemDisabled]: !canRedo
          })}
          disabled={!canRedo}
          onClick={() => {
            editor.dispatchCommand(REDO_COMMAND, undefined);
          }}
        >
          <RedoOutlined />
        </button>
      </Tooltip>
      <div className={classNameMaps.divider} />
      <Tooltip title="有序列表">
        <button
          className={classNames(classNameMaps.item, {
            [classNameMaps.itemActived]: blockType === 'number'
          })}
          onClick={() => {
            if (blockType !== 'number') {
              editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
            } else {
              editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
            }
          }}
        >
          <OrderedListOutlined />
        </button>
      </Tooltip>
      <Tooltip title="无序列表">
        <button
          className={classNames(classNameMaps.item, {
            [classNameMaps.itemActived]: blockType === 'bullet'
          })}
          onClick={() => {
            if (blockType !== 'bullet') {
              editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
            } else {
              editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
            }
          }}
        >
          <UnorderedListOutlined />
        </button>
      </Tooltip>
      <div className={classNameMaps.divider} />
      <Tooltip title="粗体">
        <button
          className={classNames(classNameMaps.item, {
            [classNameMaps.itemActived]: isBold
          })}
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
          }}
        >
          <BoldOutlined />
        </button>
      </Tooltip>
      <Tooltip title="斜体">
        <button
          className={classNames(classNameMaps.item, {
            [classNameMaps.itemActived]: isItalic
          })}
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
          }}
        >
          <ItalicOutlined />
        </button>
      </Tooltip>
      <div className={classNameMaps.divider} />
      <Tooltip title="上传图片">
        <Upload accept="images/*" beforeUpload={onUpload} fileList={[]}>
          <button className={classNameMaps.item}>
            <FileImageOutlined />
          </button>
        </Upload>
      </Tooltip>
    </div>
  );
};
