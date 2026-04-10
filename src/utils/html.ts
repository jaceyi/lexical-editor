import {
  $isElementNode,
  $isTextNode,
  DOMConversionMap,
  DOMConversion,
  ParagraphNode,
  TextNode,
  LexicalNode,
  DOMConversionOutput
} from 'lexical';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode, AutoLinkNode } from '@lexical/link';

const hasInlineStyle = (element: HTMLElement): boolean => {
  return Boolean(element.getAttribute('style') || element.style.textAlign);
};

const normalizeStyleText = (styleText: string): string => {
  const trimmed = styleText.trim();
  return trimmed.endsWith(';') ? trimmed : `${trimmed};`;
};

const collectAncestorStyles = (element: HTMLElement): string => {
  const styles: string[] = [];
  let current: HTMLElement | null = element;

  while (current) {
    const style = current.getAttribute('style');
    if (style) {
      styles.push(style);
    }
    current = current.parentElement;
  }

  if (styles.length === 0) {
    return '';
  }

  return styles.reverse().map(normalizeStyleText).join(' ');
};

/**
 * 为 Lexical 节点应用内联样式
 * 核心策略：向上遍历 DOM 树收集所有祖先节点的内联样式（如 span 的样式）
 */
const applyExtraStyles = (lexicalNode: LexicalNode, domNode: HTMLElement): void => {
  const isText = $isTextNode(lexicalNode);
  const isElement = $isElementNode(lexicalNode);

  if (!isText && !isElement) {
    return;
  }

  // 为块级元素应用文本对齐
  if (isElement && domNode instanceof HTMLElement) {
    const textAlign = domNode.style.textAlign;
    if (textAlign) {
      // @ts-expect-error Lexical 内部 format 类型与之匹配
      lexicalNode.setFormat(textAlign);
    }
  }

  const combinedStyle = collectAncestorStyles(domNode);
  if (combinedStyle) {
    const finalStyle = lexicalNode.getStyle()
      ? `${combinedStyle} ${lexicalNode.getStyle()}`
      : combinedStyle;
    lexicalNode.setStyle(finalStyle);
  }
};

/**
 * 包装 Lexical 的转换器，在转换过程中自动应用样式
 */
const wrapImporter = (importer: DOMConversion): DOMConversion => {
  return {
    ...importer,
    conversion: (domNode: Node) => {
      const output = importer.conversion(domNode as HTMLElement);

      // 包装 forChild 回调，确保子节点继承父节点的样式
      const wrapOutput = (out: DOMConversionOutput): DOMConversionOutput => {
        const originalForChild = out.forChild;
        return {
          ...out,
          forChild: (lexicalNode: LexicalNode, parent: LexicalNode | null | undefined) => {
            let resultNode = lexicalNode;
            if (originalForChild) {
              resultNode = originalForChild(lexicalNode, parent) || lexicalNode;
            }
            if (domNode instanceof HTMLElement) {
              applyExtraStyles(resultNode, domNode);
            }
            return resultNode;
          }
        };
      };

      // 如果原转换器不处理此节点，但节点有样式，则创建透传转换器
      if (!output) {
        if (domNode instanceof HTMLElement && hasInlineStyle(domNode)) {
          return wrapOutput({ node: null });
        }
        return null;
      }

      // 为转换器创建的节点应用样式
      if (output.node && domNode instanceof HTMLElement) {
        const nodes = Array.isArray(output.node) ? output.node : [output.node];
        for (const node of nodes) {
          if (node) applyExtraStyles(node, domNode);
        }
      }

      return wrapOutput(output);
    }
  };
};

/**
 * 构建自定义的 HTML 导入配置
 * 通过包装 Lexical 节点的 importDOM 方法，确保内联样式能够被正确保留
 */
export function getHTMLConfig() {
  const importMap: DOMConversionMap = {};

  // 需要支持的 Lexical 节点类型
  const nodes = [
    TextNode,
    ParagraphNode,
    HeadingNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    LinkNode,
    AutoLinkNode
  ];

  // 收集所有节点类型的 importDOM 配置，并用 wrapImporter 包装
  for (const node of nodes) {
    const nodeImportMap = node.importDOM ? node.importDOM() : null;
    if (nodeImportMap) {
      for (const [tag, fn] of Object.entries(nodeImportMap)) {
        const existingFn = importMap[tag];

        importMap[tag] = (importNode: Node) => {
          const importer = (fn as (node: Node) => ReturnType<typeof fn>)(importNode);
          if (importer) {
            return wrapImporter(importer);
          }
          if (existingFn) {
            const existingImporter = (existingFn as (node: Node) => ReturnType<typeof existingFn>)(
              importNode
            );
            if (existingImporter) return existingImporter;
          }
          return null;
        };
      }
    }
  }

  return {
    import: importMap
  };
}
