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

function applyExtraStyles(lexicalNode: LexicalNode, domNode: Node): void {
  if (!(domNode instanceof HTMLElement) && domNode.nodeType !== Node.TEXT_NODE) {
    return;
  }

  const isText = $isTextNode(lexicalNode);
  const isElement = $isElementNode(lexicalNode);

  if (!isText && !isElement) {
    return;
  }

  if (isElement && domNode instanceof HTMLElement) {
    const textAlign = domNode.style.textAlign;
    if (textAlign) {
      // @ts-expect-error Lexical 内部 format 类型与之匹配
      lexicalNode.setFormat(textAlign);
    }
  }

  let currentNode: Node | null = domNode;
  const styles: string[] = [];

  while (currentNode && currentNode instanceof HTMLElement) {
    const style = currentNode.getAttribute('style');
    if (style) {
      styles.push(style);
    }

    currentNode = currentNode.parentNode;
  }

  if (styles.length > 0) {
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

function wrapImporter(importer: DOMConversion): DOMConversion {
  return {
    ...importer,
    conversion: (domNode: Node) => {
      // @ts-expect-error Lexical converters might expect specific subtypes of Node
      const output = importer.conversion(domNode);

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

      if (!output) {
        if (
          domNode instanceof HTMLElement &&
          (domNode.getAttribute('style') || domNode.style.textAlign)
        ) {
          return wrapOutput({ node: null });
        }
        return null;
      }

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

export function getHTMLConfig() {
  const importMap: DOMConversionMap = {};

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

  const originalSpanFactory = importMap['span'];

  importMap['span'] = (importNode: Node) => {
    if (!(importNode instanceof HTMLElement)) {
      return originalSpanFactory ? (originalSpanFactory as any)(importNode) : null;
    }

    const hasStyle = importNode.getAttribute('style') || importNode.style.textAlign;

    if (hasStyle) {
      return {
        conversion: (domNode: Node) => ({
          forChild: (lexNode: LexicalNode) => {
            applyExtraStyles(lexNode, domNode);
            return lexNode;
          },
          node: null
        }),
        priority: 4
      };
    }

    return originalSpanFactory ? (originalSpanFactory as any)(importNode) : null;
  };

  return {
    import: importMap
  };
}
