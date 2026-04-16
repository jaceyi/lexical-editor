import React, { useCallback, useRef, ChangeEventHandler } from 'react';
import {
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $isTextNode,
  $isElementNode,
  $createParagraphNode,
  $insertNodes,
  FORMAT_TEXT_COMMAND,
  LexicalNode,
  ElementNode,
  TextNode
} from 'lexical';
import { $patchStyleText, $setBlocksType } from '@lexical/selection';
import { $findMatchingParent } from '@lexical/utils';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_IMAGE_COMMAND } from '../ImagePlugin';
import { INSERT_LINK_COMMAND } from '../LinkPlugin';
import { LinkPicker } from '../LinkPlugin/LinkPicker';
import { EditorConfig } from '../../Editor';
import {
  TextBoldOutlined,
  TextItalicOutlined,
  TextUnderlineOutlined,
  TextStrikethroughOutlined,
  MentionOutlined,
  FileOutlined,
  ExpandOutlined,
  TextColorOutlined,
  BackgroundColorOutlined,
  FormatPainterOutlined,
  ClearStyleOutlined
} from '../../icons';
import { $getSelectionPrevNextState } from '../../utils/lexical';
import * as typeGuards from '../../utils/typeGuards';
import { DropdownBlockFormat } from './DropdownBlockFormat';
import { DropdownFontSize } from './DropdownFontSize';
import { DropdownFontFamily } from './DropdownFontFamily';
import { DropdownBlockAlign } from './DropdownBlockAlign';
import { ColorPicker, ToolbarItem, ToolbarDivider } from '../../ui';
import { useFormatPainter } from './useFormatPainter';
import { usePopupContainer } from '../../hooks/usePopupContainer';
import { useToolbarState } from './useToolbarState';

export interface ToolbarPluginProps {
  config?: EditorConfig;
}

export const ToolbarPlugin: React.FC<ToolbarPluginProps> = ({ config = {} }) => {
  const { onUploadFile, mentions } = config;
  const [editor] = useLexicalComposerContext();
  const { getPopupContainer } = usePopupContainer();

  const { blockType, textFormat, textStyle, elementFormat, linkUrl } = useToolbarState(editor);

  const { formatPainterMode, handleFormatPainterClick, handleFormatPainterDoubleClick } =
    useFormatPainter(editor, { ...textFormat, ...textStyle, blockType });

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

  const handleClearStyle = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const collectTextNodes = (node: LexicalNode, result: TextNode[]): void => {
        if ($isTextNode(node)) {
          result.push(node);
        } else if ($isElementNode(node)) {
          node.getChildren().forEach(child => collectTextNodes(child, result));
        }
      };

      const clearTextNodeStyles = (nodes: TextNode[]) => {
        nodes.forEach(node => {
          node.setStyle('');
          if (node.hasFormat('bold')) node.toggleFormat('bold');
          if (node.hasFormat('italic')) node.toggleFormat('italic');
          if (node.hasFormat('underline')) node.toggleFormat('underline');
          if (node.hasFormat('strikethrough')) node.toggleFormat('strikethrough');
        });
      };

      if (!selection.isCollapsed()) {
        $patchStyleText(selection, {
          color: 'inherit',
          'background-color': 'inherit',
          'font-size': 'inherit',
          'font-family': 'inherit'
        });
        const updated = $getSelection();
        if ($isRangeSelection(updated)) {
          clearTextNodeStyles(updated.getNodes().filter($isTextNode) as TextNode[]);
        }
        $setBlocksType(selection, () => $createParagraphNode());
      } else {
        const anchorNode = selection.anchor.getNode();
        const blockElement =
          ($findMatchingParent(anchorNode, (node): node is ElementNode => {
            if (!$isElementNode(node)) return false;
            const parent = node.getParent();
            return parent !== null && $isRootOrShadowRoot(parent);
          }) as ElementNode | null) ?? (anchorNode.getTopLevelElementOrThrow() as ElementNode);

        if ($isElementNode(blockElement)) {
          const textNodes: TextNode[] = [];
          blockElement.getChildren().forEach(child => collectTextNodes(child, textNodes));
          clearTextNodeStyles(textNodes);
        }
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  }, [editor]);

  const handleFontColorChange = useCallback(
    (color: string | null) => {
      applyStyleText({ color: color ?? 'inherit' });
    },
    [applyStyleText]
  );

  const handleBackgroundColorChange = useCallback(
    (color: string | null) => {
      applyStyleText({ 'background-color': color ?? 'inherit' });
    },
    [applyStyleText]
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const onUpload: ChangeEventHandler<HTMLInputElement> = async e => {
    try {
      const files = e.target.files;
      if (!files || !files.length || !typeGuards.isFunction(onUploadFile)) return;
      const file = files[0];
      const image = await onUploadFile(file);
      if (!image) return;
      if (/^image\/.+$/.test(file.type)) {
        editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src: image.url, altText: image.name });
      } else {
        editor.dispatchCommand(INSERT_LINK_COMMAND, { url: image.url, title: image.name });
      }
    } catch {}
  };

  const hasMentions =
    typeGuards.isObject(mentions) &&
    mentions &&
    (Array.isArray(mentions) || Array.isArray((mentions as { mentions?: unknown }).mentions));

  return (
    <div className="editor__toolbar">
      <DropdownBlockFormat blockType={blockType} />
      <ToolbarDivider />
      <ToolbarItem
        title="加粗"
        isActive={textFormat.isBold}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
      >
        <TextBoldOutlined className="theme__icon" />
      </ToolbarItem>
      <ToolbarItem
        title="斜体"
        isActive={textFormat.isItalic}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
      >
        <TextItalicOutlined className="theme__icon" />
      </ToolbarItem>
      <ToolbarItem
        title="下划线"
        isActive={textFormat.isUnderline}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
      >
        <TextUnderlineOutlined className="theme__icon" />
      </ToolbarItem>
      <ToolbarItem
        title="删除线"
        isActive={textFormat.isStrikethrough}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
      >
        <TextStrikethroughOutlined className="theme__icon" />
      </ToolbarItem>
      <ColorPicker
        color={textStyle.fontColor}
        onColorChange={handleFontColorChange}
        getPopupContainer={getPopupContainer}
      >
        <ToolbarItem title="字体颜色">
          <TextColorOutlined className="theme__icon" />
          <ExpandOutlined className="theme__iconExpand" />
        </ToolbarItem>
      </ColorPicker>
      <ColorPicker
        color={textStyle.backgroundColor}
        onColorChange={handleBackgroundColorChange}
        getPopupContainer={getPopupContainer}
      >
        <ToolbarItem title="背景色">
          <BackgroundColorOutlined className="theme__icon" />
          <ExpandOutlined className="theme__iconExpand" />
        </ToolbarItem>
      </ColorPicker>
      <ToolbarItem
        title="格式刷：双击可重复使用"
        isActive={formatPainterMode !== null}
        onClick={handleFormatPainterClick}
        onDoubleClick={handleFormatPainterDoubleClick}
      >
        <FormatPainterOutlined className="theme__icon" />
      </ToolbarItem>
      <ToolbarItem title="清除样式" onClick={handleClearStyle}>
        <ClearStyleOutlined className="theme__icon" />
      </ToolbarItem>
      <ToolbarDivider />
      <DropdownFontFamily fontFamily={textStyle.fontFamily} />
      <DropdownFontSize fontSize={textStyle.fontSize} />
      <DropdownBlockAlign elementFormat={elementFormat} />
      <ToolbarDivider />
      <LinkPicker linkUrl={linkUrl} />
      {hasMentions && (
        <ToolbarItem title="提及" onClick={handleInsertMention}>
          <MentionOutlined className="theme__icon" />
        </ToolbarItem>
      )}
      {typeGuards.isFunction(onUploadFile) && (
        <ToolbarItem title="文件上传" onClick={() => fileInputRef.current?.click()}>
          <input
            ref={fileInputRef}
            type="file"
            value=""
            onChange={onUpload}
            className="editor__toolbarFileInput"
          />
          <FileOutlined className="theme__icon" />
        </ToolbarItem>
      )}
    </div>
  );
};
