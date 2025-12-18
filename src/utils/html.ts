import {
  $isElementNode,
  $isTextNode,
  DOMConversionMap,
  DOMConversion,
  ParagraphNode,
  TextNode,
  LexicalNode
} from 'lexical';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode, AutoLinkNode } from '@lexical/link';

/**
 * 为 Lexical 节点应用内联样式和对齐格式。
 * 方法出入参数：
 * @param lexicalNode 需要应用样式的 Lexical 节点
 * @param domNode 来源 DOM 节点
 */
function applyExtraStyles(lexicalNode: LexicalNode, domNode: Node): void {
  // 确保 domNode 是一个 HTMLElement，否则无法获取 style 和 getAttribute
  if (!(domNode instanceof HTMLElement)) {
    return;
  }

  // 1. 处理内联样式字符串
  const style = domNode.getAttribute('style');
  if (style && ($isTextNode(lexicalNode) || $isElementNode(lexicalNode))) {
    const existingStyle = lexicalNode.getStyle();
    if (existingStyle) {
      const cleanedExisting = existingStyle.trim().endsWith(';')
        ? existingStyle.trim()
        : `${existingStyle.trim()};`;
      lexicalNode.setStyle(`${cleanedExisting} ${style}`);
    } else {
      lexicalNode.setStyle(style);
    }
  }

  // 2. 处理块级对齐方式
  if ($isElementNode(lexicalNode)) {
    const textAlign = domNode.style.textAlign;
    if (textAlign) {
      // @ts-expect-error Lexical 内部 format 类型与之匹配
      lexicalNode.setFormat(textAlign);
    }
  }
}

/**
 * 包装现有的导入转换逻辑，注入自定义样式处理。
 * 方法出入参数：
 * @param importer 原始 of DOMConversion 对象
 * @param element 原始 of DOM 节点
 * @returns 增强后的 DOMConversion 对象
 */
function wrapImporter(importer: DOMConversion, element: Node): DOMConversion {
  return {
    ...importer,
    conversion: (domNode: Node) => {
      // @ts-expect-error Lexical converters might expect specific subtypes of Node
      const output = importer.conversion(domNode);
      if (!output) {
        return null;
      }

      // 情况 A: 转换器直接返回了生成的节点
      if (output.node) {
        const nodes = Array.isArray(output.node) ? output.node : [output.node];
        for (const node of nodes) {
          if (node) {
            applyExtraStyles(node, element);
          }
        }
      }

      // 情况 B: 转换器通过 forChild 钩子处理子节点
      if (output.forChild) {
        const originalForChild = output.forChild;
        return {
          ...output,
          forChild: (lexicalNode: LexicalNode, parent: LexicalNode | null | undefined) => {
            const resultNode = originalForChild(lexicalNode, parent);
            if (resultNode) {
              applyExtraStyles(resultNode, element);
            }
            return resultNode || null;
          }
        };
      }

      return output;
    }
  };
}

/**
 * 构建自定义的 HTML 导入配置，通过包装核心节点的 importDOM 来保留内联样式。
 * 方法核心逻辑：遍历核心节点的默认 importDOM 映射，对其进行包装以支持 style 属性提取。
 */
export function getHTMLConfig() {
  const importMap: DOMConversionMap = {};

  // 需要被增强样式的核心节点列表
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

  for (const node of nodes) {
    const nodeImportMap = (node as any).importDOM ? (node as any).importDOM() : null;
    if (nodeImportMap) {
      for (const [tag, fn] of Object.entries(nodeImportMap)) {
        importMap[tag] = (importNode: Node) => {
          const importer = (fn as any)(importNode);
          if (!importer) {
            return null;
          }
          return wrapImporter(importer, importNode);
        };
      }
    }
  }

  return {
    import: importMap
  };
}
