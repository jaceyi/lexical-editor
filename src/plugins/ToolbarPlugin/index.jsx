import './style.scss';
import { useState, useEffect, useCallback } from 'react';
import {
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  FORMAT_TEXT_COMMAND
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  mergeRegister,
  $findMatchingParent,
  $getNearestNodeOfType
} from '@lexical/utils';
import { INSERT_IMAGE_COMMAND } from '../ImagePlugin';
import { INSERT_FILE_COMMAND } from '../FilePlugin';
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  REMOVE_LIST_COMMAND
} from '@lexical/list';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { Icon } from '@/components';

const classNameMaps = {
  item: 'editor__toolbarItem',
  itemDisabled: 'editor__toolbarItem_disabled',
  itemActived: 'editor__toolbarItem_actived',
  divider: 'editor__toolbarDivider',
  fileInput: 'editor__toolbarFileInput'
};

export const ToolbarPlugin = ({ onFileUpload }) => {
  const [editor] = useLexicalComposerContext();

  const [blockType, setBlockType] = useState('paragraph');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

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
      setIsUnderline(selection.hasFormat('underline'));
    }
  }, [editor]);
  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      })
    );
  }, [$updateToolbar, editor]);

  const onUpload = async e => {
    try {
      const [file] = e.target.files;
      if (!file) return;
      const image = await onFileUpload(file);
      if (!image) return;
      if (/^image\/.+$/.test(file.type)) {
        editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
          src: image.url,
          altText: image.name
        });
      } else {
        editor.dispatchCommand(INSERT_FILE_COMMAND, {
          url: image.url,
          name: image.name
        });
      }
    } catch {}
  };

  return (
    <div className="editor__toolbar">
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
        <Icon type="ol" />
      </button>
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
        <Icon type="ul" />
      </button>
      <div className={classNameMaps.divider} />
      <button
        className={classNames(classNameMaps.item, {
          [classNameMaps.itemActived]: isBold
        })}
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
        }}
      >
        <Icon type="textBold" />
      </button>
      <button
        className={classNames(classNameMaps.item, {
          [classNameMaps.itemActived]: isItalic
        })}
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
        }}
      >
        <Icon type="textItalic" />
      </button>
      <button
        className={classNames(classNameMaps.item, {
          [classNameMaps.itemActived]: isUnderline
        })}
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
        }}
      >
        <Icon type="textUnderline" />
      </button>
      {typeof onFileUpload === 'function' && (
        <>
          <div className={classNameMaps.divider} />
          <label>
            <input
              type="file"
              value=""
              onChange={onUpload}
              className={classNameMaps.fileInput}
            />
            <div className={classNameMaps.item}>
              <Icon type="file" />
            </div>
          </label>
        </>
      )}
    </div>
  );
};

ToolbarPlugin.propTypes = {
  onFileUpload: PropTypes.func
};
