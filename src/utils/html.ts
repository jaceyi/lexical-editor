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

/**
 * 为 Lexical 节点应用内联样式
 * 核心策略：向上遍历 DOM 树收集所有祖先节点的内联样式（如 span 的样式）
 */
function applyExtraStyles(lexicalNode: LexicalNode, domNode: Node): void {
  if (!(domNode instanceof HTMLElement) && domNode.nodeType !== Node.TEXT_NODE) {
    return;
  }

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

  // 向上遍历 DOM 树，收集所有祖先节点的内联样式
  let currentNode: Node | null = domNode;
  const styles: string[] = [];

  while (currentNode && currentNode instanceof HTMLElement) {
    const style = currentNode.getAttribute('style');
    if (style) {
      styles.push(style);
    }

    currentNode = currentNode.parentNode;
  }

  // 合并样式并应用到 Lexical 节点
  if (styles.length > 0) {
    // 逆序合并：离文本越近的样式优先级越高
    const combinedStyle = styles
      .reverse()
      .map(s => {
        const trimmed = s.trim();
        return trimmed.endsWith(';') ? trimmed : `${trimmed};`;
      })
      .join(' ');

    const existing = lexicalNode.getStyle();
    const finalStyle = existing ? `${combinedStyle} ${existing}` : combinedStyle;
    lexicalNode.setStyle(finalStyle);
  }
}

/**
 * 包装 Lexical 的转换器，在转换过程中自动应用样式
 */
function wrapImporter(importer: DOMConversion): DOMConversion {
  return {
    ...importer,
    conversion: (domNode: Node) => {
      // @ts-expect-error Lexical converters might expect specific subtypes of Node
      const output = importer.conversion(domNode);

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
            applyExtraStyles(resultNode, domNode);
            return resultNode;
          }
        };
      };

      // 如果原转换器不处理此节点，但节点有样式，则创建透传转换器
      if (!output) {
        if (
          domNode instanceof HTMLElement &&
          (domNode.getAttribute('style') || domNode.style.textAlign)
        ) {
          return wrapOutput({ node: null });
        }
        return null;
      }

      // 为转换器创建的节点应用样式
      if (output.node) {
        const nodes = Array.isArray(output.node) ? output.node : [output.node];
        for (const node of nodes) {
          if (node) applyExtraStyles(node, domNode);
        }
      }

      return wrapOutput(output);
    }
  };
}

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
    const nodeImportMap = (node as any).importDOM ? (node as any).importDOM() : null;
    if (nodeImportMap) {
      for (const [tag, fn] of Object.entries(nodeImportMap)) {
        const existingFn = importMap[tag];

        importMap[tag] = (importNode: Node) => {
          const importer = (fn as any)(importNode);
          if (importer) {
            return wrapImporter(importer);
          }
          if (existingFn) {
            const existingImporter = (existingFn as any)(importNode);
            if (existingImporter) return existingImporter;
          }
          return null;
        };
      }
    }
  }

  // 特殊处理 span 标签：它通常用作样式容器，但 Lexical 默认会跳过
  const originalSpanFactory = importMap['span'];

  importMap['span'] = (importNode: Node) => {
    if (!(importNode instanceof HTMLElement)) {
      return originalSpanFactory ? (originalSpanFactory as any)(importNode) : null;
    }

    const hasStyle = importNode.getAttribute('style') || importNode.style.textAlign;

    // 如果 span 有样式，创建一个高优先级的透传转换器
    // 它不创建节点，只将样式应用到子节点
    if (hasStyle) {
      return {
        conversion: (domNode: Node) => ({
          forChild: (lexNode: LexicalNode) => {
            applyExtraStyles(lexNode, domNode);
            return lexNode;
          },
          node: null
        }),
        priority: 4 // 高优先级确保此转换器被优先使用
      };
    }

    // 无样式的 span 使用原有转换器（如 MentionNode 的特殊 span）
    return originalSpanFactory ? (originalSpanFactory as any)(importNode) : null;
  };

  return {
    import: importMap
  };
}
