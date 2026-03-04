import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LexicalEditor,
  LexicalNode,
  TextNode,
  ElementNode,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  $isElementNode,
  $isRootOrShadowRoot,
  $createParagraphNode
} from 'lexical';
import { $setBlocksType, $patchStyleText } from '@lexical/selection';
import { $createHeadingNode, HeadingTagType, $createQuoteNode } from '@lexical/rich-text';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { $findMatchingParent } from '@lexical/utils';

export interface CopiedFormat {
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  fontColor: string | null;
  backgroundColor: string | null;
  fontSize: string | null;
  blockType: string;
}

export type FormatPainterMode = null | 'single' | 'multi';

export interface CurrentFormatState {
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  fontColor: string | null;
  backgroundColor: string | null;
  fontSize: string | null;
  blockType: string;
}

// 遍历节点树，收集所有 TextNode
const collectTextNodes = (node: LexicalNode, result: TextNode[]): void => {
  if ($isTextNode(node)) {
    result.push(node);
  } else if ($isElementNode(node)) {
    node.getChildren().forEach(child => collectTextNodes(child, result));
  }
};

export const useFormatPainter = (editor: LexicalEditor, currentFormat: CurrentFormatState) => {
  const [formatPainterMode, setFormatPainterModeState] = useState<FormatPainterMode>(null);
  const formatPainterModeRef = useRef<FormatPainterMode>(null);
  const copiedFormatRef = useRef<CopiedFormat | null>(null);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 用 ref 保持 currentFormat 的最新值，避免闭包捕获旧值
  const currentFormatRef = useRef<CurrentFormatState>(currentFormat);
  currentFormatRef.current = currentFormat;

  const setFormatPainterMode = useCallback((mode: FormatPainterMode) => {
    formatPainterModeRef.current = mode;
    setFormatPainterModeState(mode);
  }, []);

  // 应用格式刷粘贴
  const applyFormat = useCallback(
    (format: CopiedFormat) => {
      editor.update(() => {
        // 应用块类型
        const { blockType } = format;
        if (blockType === 'number') {
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        } else if (blockType === 'bullet') {
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        } else {
          editor.update(() => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) return;

            switch (blockType) {
              case 'paragraph':
                $setBlocksType(selection, () => $createParagraphNode());
                break;
              case 'h1':
              case 'h2':
              case 'h3':
                $setBlocksType(selection, () => $createHeadingNode(blockType as HeadingTagType));
                break;
              case 'quote':
                $setBlocksType(selection, () => $createQuoteNode());
                break;
            }
          });
        }

        // 应用内联格式
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        if (selection.isCollapsed()) {
          const anchorNode = selection.anchor.getNode();

          const blockElement =
            ($findMatchingParent(anchorNode, (node): node is ElementNode => {
              if (!$isElementNode(node)) return false;
              const parent = node.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            }) as ElementNode | null) ?? (anchorNode.getTopLevelElementOrThrow() as ElementNode);

          if ($isElementNode(blockElement)) {
            // 收集块内所有 TextNode，扩展 selection 到整个块
            const textNodes: TextNode[] = [];
            blockElement.getChildren().forEach(child => collectTextNodes(child, textNodes));

            if (textNodes.length > 0) {
              const firstText = textNodes[0];
              const lastText = textNodes[textNodes.length - 1];
              selection.anchor.set(firstText.getKey(), 0, 'text');
              selection.focus.set(lastText.getKey(), lastText.getTextContentSize(), 'text');
            }
          }
        }

        // 先应用颜色、背景色、字号
        // $patchStyleText 会在选区边界处切分 TextNode，同步更新 selection 锚点/焦点，
        // 切分后的节点均完整落在选区内，之后对 getNodes() 的结果应用 toggleFormat 才是精确的
        $patchStyleText(selection, {
          color: format.fontColor ?? 'inherit',
          'background-color': format.backgroundColor ?? 'inherit',
          'font-size': format.fontSize ?? 'inherit'
        });

        // 重新读取 selection（$patchStyleText 切分节点后 selection 的锚/焦已更新）
        // 此时 getNodes() 返回的 TextNode 均已与选区边界对齐，可以安全地整节点操作
        const updatedSelection = $getSelection();
        if (!$isRangeSelection(updatedSelection)) return;

        updatedSelection.getNodes().forEach(node => {
          if ($isTextNode(node)) {
            if (format.isBold !== node.hasFormat('bold')) node.toggleFormat('bold');
            if (format.isItalic !== node.hasFormat('italic')) node.toggleFormat('italic');
            if (format.isUnderline !== node.hasFormat('underline')) node.toggleFormat('underline');
          }
        });
      });
    },
    [editor]
  );

  // 格式刷激活时：监听编辑器区域鼠标松开事件来触发粘贴，并改变光标样式
  useEffect(() => {
    if (formatPainterMode === null) return;

    const rootElement = editor.getRootElement();
    if (!rootElement) return;

    rootElement.style.cursor = 'copy';

    const handleMouseUp = () => {
      const format = copiedFormatRef.current;
      if (!format) return;

      applyFormat(format);

      if (formatPainterModeRef.current === 'single') {
        setFormatPainterMode(null);
        copiedFormatRef.current = null;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFormatPainterMode(null);
        copiedFormatRef.current = null;
      }
    };

    rootElement.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      rootElement.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
      rootElement.style.cursor = '';
    };
  }, [editor, formatPainterMode, applyFormat, setFormatPainterMode]);

  const cancelFormatPainter = useCallback(() => {
    setFormatPainterMode(null);
    copiedFormatRef.current = null;
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
  }, [setFormatPainterMode]);

  // 格式刷按钮单击：若已激活则取消；否则延迟 250ms 确认非双击后进入单次模式
  const handleFormatPainterClick = useCallback(() => {
    if (formatPainterModeRef.current !== null) {
      cancelFormatPainter();
      return;
    }

    // 在点击时立即捕获当前格式，避免 250ms 后格式发生变化
    const capturedFormat = { ...currentFormatRef.current };

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    clickTimerRef.current = setTimeout(() => {
      clickTimerRef.current = null;
      copiedFormatRef.current = capturedFormat;
      setFormatPainterMode('single');
    }, 250);
  }, [cancelFormatPainter, setFormatPainterMode]);

  // 格式刷按钮双击：取消单击延时，进入多次粘贴模式
  const handleFormatPainterDoubleClick = useCallback(() => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }

    if (formatPainterModeRef.current !== null) {
      cancelFormatPainter();
      return;
    }

    copiedFormatRef.current = { ...currentFormatRef.current };
    setFormatPainterMode('multi');
  }, [cancelFormatPainter, setFormatPainterMode]);

  return {
    formatPainterMode,
    handleFormatPainterClick,
    handleFormatPainterDoubleClick
  };
};
