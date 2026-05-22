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
import { TOOLBAR_FEATURES, type ToolbarFeatureKey } from '../../utils/consts';
import * as typeGuards from '../../utils/typeGuards';
import { DropdownBlockFormat } from './DropdownBlockFormat';
import { DropdownFontSize } from './DropdownFontSize';
import { DropdownFontFamily } from './DropdownFontFamily';
import { DropdownBlockAlign } from './DropdownBlockAlign';
import { ColorPicker, ToolbarItem, ToolbarDivider } from '../../ui';
import { useFormatPainter } from './useFormatPainter';
import { usePopupContainer } from '../../hooks/usePopupContainer';
import { useToolbarState } from './useToolbarState';
import { useLocale } from '../../locale';

export interface ToolbarPluginProps {
  config?: Omit<EditorConfig, 'toolbar'> & { toolbar?: ToolbarFeatureKey[] };
}

export const ToolbarPlugin: React.FC<ToolbarPluginProps> = ({ config = {} }) => {
  const { onUploadFile, mentions, toolbar } = config;
  const [editor] = useLexicalComposerContext();
  const locale = useLocale();
  const featureSet = toolbar ? new Set(toolbar) : null;
  const show = (key: ToolbarFeatureKey) => !featureSet || featureSet.has(key);
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
    (styles: Record<string, string | null>) => {
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
          color: null,
          'background-color': null,
          'font-size': null,
          'font-family': null
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
      applyStyleText({ color });
    },
    [applyStyleText]
  );

  const handleBackgroundColorChange = useCallback(
    (color: string | null) => {
      applyStyleText({ 'background-color': color });
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

  const showGroupBlock = show(TOOLBAR_FEATURES.BLOCK_FORMAT);
  const showGroupText =
    show(TOOLBAR_FEATURES.BOLD) ||
    show(TOOLBAR_FEATURES.ITALIC) ||
    show(TOOLBAR_FEATURES.UNDERLINE) ||
    show(TOOLBAR_FEATURES.STRIKETHROUGH) ||
    show(TOOLBAR_FEATURES.FONT_COLOR) ||
    show(TOOLBAR_FEATURES.BACKGROUND_COLOR) ||
    show(TOOLBAR_FEATURES.FORMAT_PAINTER) ||
    show(TOOLBAR_FEATURES.CLEAR_STYLE);
  const showGroupFont =
    show(TOOLBAR_FEATURES.FONT_FAMILY) ||
    show(TOOLBAR_FEATURES.FONT_SIZE) ||
    show(TOOLBAR_FEATURES.BLOCK_ALIGN);
  const showGroupInsert =
    show(TOOLBAR_FEATURES.LINK) ||
    (show(TOOLBAR_FEATURES.MENTION) && hasMentions) ||
    (show(TOOLBAR_FEATURES.FILE_UPLOAD) && typeGuards.isFunction(onUploadFile));

  const groupHasItems = [showGroupBlock, showGroupText, showGroupFont, showGroupInsert];
  const dividerAfter = groupHasItems.map(
    (visible, i) => visible && groupHasItems.slice(i + 1).some(Boolean)
  );

  return (
    <div className="editor__toolbar">
      {show(TOOLBAR_FEATURES.BLOCK_FORMAT) && <DropdownBlockFormat blockType={blockType} />}
      {dividerAfter[0] && <ToolbarDivider />}
      {show(TOOLBAR_FEATURES.BOLD) && (
        <ToolbarItem
          title={locale.bold}
          isActive={textFormat.isBold}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        >
          <TextBoldOutlined className="theme__icon" />
        </ToolbarItem>
      )}
      {show(TOOLBAR_FEATURES.ITALIC) && (
        <ToolbarItem
          title={locale.italic}
          isActive={textFormat.isItalic}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        >
          <TextItalicOutlined className="theme__icon" />
        </ToolbarItem>
      )}
      {show(TOOLBAR_FEATURES.UNDERLINE) && (
        <ToolbarItem
          title={locale.underline}
          isActive={textFormat.isUnderline}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
        >
          <TextUnderlineOutlined className="theme__icon" />
        </ToolbarItem>
      )}
      {show(TOOLBAR_FEATURES.STRIKETHROUGH) && (
        <ToolbarItem
          title={locale.strikethrough}
          isActive={textFormat.isStrikethrough}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
        >
          <TextStrikethroughOutlined className="theme__icon" />
        </ToolbarItem>
      )}
      {show(TOOLBAR_FEATURES.FONT_COLOR) && (
        <ColorPicker
          color={textStyle.fontColor}
          onColorChange={handleFontColorChange}
          getPopupContainer={getPopupContainer}
        >
          <ToolbarItem title={locale.fontColor}>
            <TextColorOutlined className="theme__icon" />
            <ExpandOutlined className="theme__iconExpand" />
          </ToolbarItem>
        </ColorPicker>
      )}
      {show(TOOLBAR_FEATURES.BACKGROUND_COLOR) && (
        <ColorPicker
          color={textStyle.backgroundColor}
          onColorChange={handleBackgroundColorChange}
          getPopupContainer={getPopupContainer}
        >
          <ToolbarItem title={locale.backgroundColor}>
            <BackgroundColorOutlined className="theme__icon" />
            <ExpandOutlined className="theme__iconExpand" />
          </ToolbarItem>
        </ColorPicker>
      )}
      {show(TOOLBAR_FEATURES.FORMAT_PAINTER) && (
        <ToolbarItem
          title={`${locale.formatPainter}：${locale.formatPainterHint}`}
          isActive={formatPainterMode !== null}
          onClick={handleFormatPainterClick}
          onDoubleClick={handleFormatPainterDoubleClick}
        >
          <FormatPainterOutlined className="theme__icon" />
        </ToolbarItem>
      )}
      {show(TOOLBAR_FEATURES.CLEAR_STYLE) && (
        <ToolbarItem title={locale.clearStyle} onClick={handleClearStyle}>
          <ClearStyleOutlined className="theme__icon" />
        </ToolbarItem>
      )}
      {dividerAfter[1] && <ToolbarDivider />}
      {show(TOOLBAR_FEATURES.FONT_FAMILY) && (
        <DropdownFontFamily fontFamily={textStyle.fontFamily} />
      )}
      {show(TOOLBAR_FEATURES.FONT_SIZE) && <DropdownFontSize fontSize={textStyle.fontSize} />}
      {show(TOOLBAR_FEATURES.BLOCK_ALIGN) && <DropdownBlockAlign elementFormat={elementFormat} />}
      {dividerAfter[2] && <ToolbarDivider />}
      {show(TOOLBAR_FEATURES.LINK) && <LinkPicker linkUrl={linkUrl} />}
      {show(TOOLBAR_FEATURES.MENTION) && hasMentions && (
        <ToolbarItem title={locale.mention} onClick={handleInsertMention}>
          <MentionOutlined className="theme__icon" />
        </ToolbarItem>
      )}
      {show(TOOLBAR_FEATURES.FILE_UPLOAD) && typeGuards.isFunction(onUploadFile) && (
        <ToolbarItem title={locale.fileUpload} onClick={() => fileInputRef.current?.click()}>
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
