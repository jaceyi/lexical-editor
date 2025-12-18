import React, { useState, useEffect, useCallback, ChangeEventHandler, useRef } from 'react';
import {
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $insertNodes,
  FORMAT_TEXT_COMMAND,
  TextNode
} from 'lexical';
import { $isHeadingNode } from '@lexical/rich-text';
import { $isLinkNode } from '@lexical/link';
import { $patchStyleText, $getSelectionStyleValueForProperty } from '@lexical/selection';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $findMatchingParent, $getNearestNodeOfType } from '@lexical/utils';
import { INSERT_IMAGE_COMMAND } from '../ImagePlugin';
import { INSERT_LINK_COMMAND } from '../LinkPlugin';
import { LinkPicker } from '../LinkPlugin/LinkPicker';
import { $isListNode, ListNode } from '@lexical/list';
import { EditorConfig } from '../../Editor';
import {
  TextBoldOutlined,
  TextItalicOutlined,
  TextUnderlineOutlined,
  MentionOutlined,
  FileOutlined,
  ExpandOutlined,
  TextColorOutlined,
  BackgroundColorOutlined
} from '../../icons';
import { $getSelectionPrevNextState } from '../../utils/lexical';
import * as typeGuards from '../../utils/typeGuards';
import { getSelectedNode } from './utils';
import { DropdownBlockFormat } from './DropdownBlockFormat';
import { DropdownFontSize } from './DropdownFontSize';
import { DropdownBlockAlign } from './DropdownBlockAlign';
import { ColorPicker, ToolbarItem, ToolbarDivider } from '../../ui';

const classNameMaps = {
  fileInput: 'editor__toolbarFileInput'
};

export interface ToolbarPluginProps {
  config?: EditorConfig;
}

export const ToolbarPlugin: React.FC<ToolbarPluginProps> = ({ config = {} }) => {
  const { onUploadFile, mentions } = config;

  const [editor] = useLexicalComposerContext();

  const [blockType, setBlockType] = useState('root');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [fontColor, setFontColor] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<string | null>(null);
  const [elementFormat, setElementFormat] = useState<string>('left');
  const [linkData, setLinkData] = useState<{ isLink: boolean; url: string | null }>({
    isLink: false,
    url: null
  });

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

      const node = getSelectedNode(selection);
      const parent = node.getParent();

      // block format
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);
      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode);
          const type = parentList ? parentList.getListType() : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element) ? element.getTag() : element.getType();
          setBlockType(type);
        }
      }

      // text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setFontColor($getSelectionStyleValueForProperty(selection, 'color'));
      setBackgroundColor($getSelectionStyleValueForProperty(selection, 'background-color'));
      setFontSize($getSelectionStyleValueForProperty(selection, 'font-size'));

      // Update links
      if ($isLinkNode(parent)) {
        setLinkData({ isLink: true, url: parent.getURL() });
      } else if ($isLinkNode(node)) {
        setLinkData({ isLink: true, url: node.getURL() });
      } else {
        setLinkData({ isLink: false, url: null });
      }

      // Update block align
      setElementFormat(
        ($isElementNode(node) ? node.getFormatType() : parent?.getFormatType()) || 'left'
      );
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
      if (!selectionState.prevTextIsSpace && !selectionState.startPointIsFirst) {
        space = ' ';
      }
      $insertNodes([new TextNode(`${space}@`)]);
    });
  };

  /**
   * 对当前选区应用样式。
   * @param styles 样式键值对
   * @returns void
   */
  const applyStyleText = useCallback(
    (styles: Record<string, string>) => {
      editor.update(() => {
        const selection = $getSelection();
        if (selection !== null) {
          $patchStyleText(selection, styles);
        }
      });
    },
    [editor]
  );

  /**
   * 处理字体颜色变更，null 表示清除。
   * @param color 颜色值或 null
   * @returns void
   */
  const handleFontColorChange = useCallback(
    (color: string | null) => {
      applyStyleText({ color: color ?? 'inherit' });
    },
    [applyStyleText]
  );

  /**
   * 处理背景颜色变更，null 表示清除。
   * @param color 颜色值或 null
   * @returns void
   */
  const handleBackgroundColorChange = useCallback(
    (color: string | null) => {
      applyStyleText({ 'background-color': color ?? 'inherit' });
    },
    [applyStyleText]
  );

  const onUpload: ChangeEventHandler<HTMLInputElement> = async e => {
    try {
      const files = e.target.files;
      if (!files || !files.length || !typeGuards.isFunction(onUploadFile)) {
        return;
      }
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
          title: image.name
        });
      }
    } catch {}
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="editor__toolbar">
      <DropdownBlockFormat blockType={blockType} />
      <ToolbarDivider />
      <ToolbarItem
        isActive={isBold}
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
        }}
      >
        <TextBoldOutlined className="theme__icon" />
      </ToolbarItem>
      <ToolbarItem
        isActive={isItalic}
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
        }}
      >
        <TextItalicOutlined className="theme__icon" />
      </ToolbarItem>
      <ToolbarItem
        isActive={isUnderline}
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
        }}
      >
        <TextUnderlineOutlined className="theme__icon" />
      </ToolbarItem>
      <ColorPicker value={fontColor} onChange={handleFontColorChange}>
        <ToolbarItem>
          <TextColorOutlined className="theme__icon" />
          <ExpandOutlined className="theme__iconExpand" />
        </ToolbarItem>
      </ColorPicker>
      <ColorPicker value={backgroundColor} onChange={handleBackgroundColorChange}>
        <ToolbarItem>
          <BackgroundColorOutlined className="theme__icon" />
          <ExpandOutlined className="theme__iconExpand" />
        </ToolbarItem>
      </ColorPicker>
      <ToolbarDivider />
      <DropdownFontSize fontSize={fontSize} />
      <LinkPicker linkData={linkData} />
      <DropdownBlockAlign elementFormat={elementFormat} />
      <ToolbarDivider />
      {typeGuards.isObject(mentions) &&
        mentions &&
        (Array.isArray(mentions) || Array.isArray(mentions.mentions)) && (
          <ToolbarItem onClick={handleInsertMention}>
            <MentionOutlined className="theme__icon" />
          </ToolbarItem>
        )}
      {typeGuards.isFunction(onUploadFile) && (
        <>
          <ToolbarItem onClick={() => fileInputRef.current?.click()}>
            <input
              ref={fileInputRef}
              type="file"
              value=""
              onChange={onUpload}
              className={classNameMaps.fileInput}
            />
            <FileOutlined className="theme__icon" />
          </ToolbarItem>
        </>
      )}
    </div>
  );
};
