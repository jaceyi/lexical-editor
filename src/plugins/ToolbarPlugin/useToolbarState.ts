import { useCallback, useEffect, useState } from 'react';
import {
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  LexicalEditor
} from 'lexical';
import { $isHeadingNode } from '@lexical/rich-text';
import { $isLinkNode } from '@lexical/link';
import { $getSelectionStyleValueForProperty } from '@lexical/selection';
import { $findMatchingParent, $getNearestNodeOfType } from '@lexical/utils';
import { $isListNode, ListNode } from '@lexical/list';
import { getSelectedNode } from './utils';

export interface TextFormat {
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikethrough: boolean;
}

export interface TextStyle {
  fontColor: string | null;
  backgroundColor: string | null;
  fontSize: string | null;
  fontFamily: string | null;
}

export interface ToolbarState {
  blockType: string;
  textFormat: TextFormat;
  textStyle: TextStyle;
  elementFormat: string;
  linkUrl: string | null;
}

const defaultTextFormat: TextFormat = {
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isStrikethrough: false
};

const defaultTextStyle: TextStyle = {
  fontColor: null,
  backgroundColor: null,
  fontSize: null,
  fontFamily: null
};

export const useToolbarState = (editor: LexicalEditor): ToolbarState => {
  const [blockType, setBlockType] = useState('paragraph');
  const [textFormat, setTextFormat] = useState<TextFormat>(defaultTextFormat);
  const [textStyle, setTextStyle] = useState<TextStyle>(defaultTextStyle);
  const [elementFormat, setElementFormat] = useState<string>('left');
  const [linkUrl, setLinkUrl] = useState<string | null>(null);

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;

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

    // block type
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
    setTextFormat({
      isBold: selection.hasFormat('bold'),
      isItalic: selection.hasFormat('italic'),
      isUnderline: selection.hasFormat('underline'),
      isStrikethrough: selection.hasFormat('strikethrough')
    });

    // text style
    setTextStyle({
      fontColor: $getSelectionStyleValueForProperty(selection, 'color'),
      backgroundColor: $getSelectionStyleValueForProperty(selection, 'background-color'),
      fontSize: $getSelectionStyleValueForProperty(selection, 'font-size'),
      fontFamily: $getSelectionStyleValueForProperty(selection, 'font-family')
    });

    // link url
    if ($isLinkNode(parent)) {
      setLinkUrl(parent.getURL());
    } else if ($isLinkNode(node)) {
      setLinkUrl((node as typeof parent & { getURL?: () => string })?.getURL?.() ?? null);
    } else {
      setLinkUrl(null);
    }

    // element align
    setElementFormat(
      ($isElementNode(node) ? node.getFormatType() : parent?.getFormatType()) || 'left'
    );
  }, [editor]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        $updateToolbar();
      });
    });
  }, [$updateToolbar, editor]);

  return { blockType, textFormat, textStyle, elementFormat, linkUrl };
};
