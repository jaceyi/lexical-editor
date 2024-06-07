import React, {
  useState,
  useEffect,
  useCallback,
  ChangeEventHandler,
  useRef
} from 'react';
import {
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $insertNodes,
  FORMAT_TEXT_COMMAND,
  TextNode
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $findMatchingParent, $getNearestNodeOfType } from '@lexical/utils';
import { INSERT_IMAGE_COMMAND } from './ImagePlugin';
import { INSERT_LINK_COMMAND } from './LinkPlugin';
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  REMOVE_LIST_COMMAND
} from '@lexical/list';
import classNames from 'classnames';
import { EditorConfig } from '../Editor';
import {
  OrderedListOutlined,
  UnorderedListOutlined,
  TextBoldOutlined,
  TextItalicOutlined,
  TextUnderlineOutlined,
  MentionOutlined,
  FileOutlined
} from '../icons';
import { $getSelectionPrevNextState } from '../utils';

const classNameMaps = {
  item: 'editor__toolbarItem',
  itemDisabled: 'editor__toolbarItem_disabled',
  itemActived: 'editor__toolbarItem_actived',
  divider: 'editor__toolbarDivider',
  fileInput: 'editor__toolbarFileInput'
};

export interface ToolbarPluginProps {
  config?: EditorConfig;
}

export const ToolbarPlugin: React.FC<ToolbarPluginProps> = ({
  config = {}
}) => {
  const { onUploadFile, mentions } = config;

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
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        $updateToolbar();
      });
    });
  }, [$updateToolbar, editor]);

  const handleInsertMention = () => {
    editor.update(() => {
      let space = '';
      const selectionState = $getSelectionPrevNextState();
      if (
        !selectionState.prevTextIsSpace &&
        !selectionState.startPointIsFirst
      ) {
        space = ' ';
      }
      $insertNodes([new TextNode(`${space}@`)]);
    });
  };

  const onUpload: ChangeEventHandler<HTMLInputElement> = async e => {
    try {
      const files = e.target.files;
      if (!files || !files.length || typeof onUploadFile !== 'function') return;
      const file = files[0];
      const image = await onUploadFile(file);
      if (!image) return;
      if (/^image\/.+$/.test(file.type)) {
        editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
          src: image.url,
          altText: image.name
        });
      } else {
        editor.dispatchCommand(INSERT_LINK_COMMAND, {
          url: image.url,
          text: image.name
        });
      }
    } catch {}
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

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
        title="Numbered List"
      >
        <OrderedListOutlined />
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
        title="Bulleted List"
      >
        <UnorderedListOutlined />
      </button>
      <div className={classNameMaps.divider} />
      <button
        className={classNames(classNameMaps.item, {
          [classNameMaps.itemActived]: isBold
        })}
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
        }}
        title="Bold Text"
      >
        <TextBoldOutlined />
      </button>
      <button
        className={classNames(classNameMaps.item, {
          [classNameMaps.itemActived]: isItalic
        })}
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
        }}
        title="Italic Text"
      >
        <TextItalicOutlined />
      </button>
      <button
        className={classNames(classNameMaps.item, {
          [classNameMaps.itemActived]: isUnderline
        })}
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
        }}
        title="Underline Text"
      >
        <TextUnderlineOutlined />
      </button>
      {typeof mentions === 'object' &&
        mentions &&
        (Array.isArray(mentions) || Array.isArray(mentions.mentions)) && (
          <button
            className={classNameMaps.item}
            onClick={handleInsertMention}
            title="Mention"
          >
            <MentionOutlined />
          </button>
        )}
      {typeof onUploadFile === 'function' && (
        <>
          <div className={classNameMaps.divider} />
          <button
            className={classNameMaps.item}
            title="Upload File"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              value=""
              onChange={onUpload}
              className={classNameMaps.fileInput}
            />
            <FileOutlined />
          </button>
        </>
      )}
    </div>
  );
};
