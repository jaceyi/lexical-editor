import {
  $getSelection,
  $getNodeByKey,
  LexicalNode,
  $isNodeSelection
} from 'lexical';

export const $getSelectionPrevNextState = () => {
  const isSpace = (text: string) => text === ' ';
  const spaceState = {
    prevTextIsSpace: false,
    nextTextIsSpace: false,
    startPointIsFirst: false,
    endPointIsLast: false
  };

  const selection = $getSelection();
  const getPrevNodeText = (node: LexicalNode) => {
    const prevNode = node.getPreviousSibling();
    if (prevNode) {
      const text = prevNode.getTextContent();
      spaceState.prevTextIsSpace = isSpace(text[text.length - 1]);
    } else {
      // startNode is the first node in the parent node
      spaceState.startPointIsFirst = true;
    }
  };
  const getNextNodeText = (node: LexicalNode) => {
    const nextNode = node.getNextSibling();
    if (nextNode) {
      const text = nextNode.getTextContent();
      spaceState.nextTextIsSpace = isSpace(text[0]);
    } else {
      // endNode is the last node in the parent node
      spaceState.endPointIsLast = true;
    }
  };
  if (selection) {
    if ($isNodeSelection(selection)) {
      const [node] = selection.getNodes();
      if (node) {
        getPrevNodeText(node);
        getNextNodeText(node);
      }
    } else {
      const points = selection.getStartEndPoints();
      if (points) {
        const [start, end] = points;
        const startNode = $getNodeByKey(start.key);
        const endNode = $getNodeByKey(end.key);
        if (startNode && endNode) {
          if (start.offset === 0) {
            getPrevNodeText(startNode);
          } else {
            const text = startNode.getTextContent();
            spaceState.prevTextIsSpace = isSpace(text[start.offset - 1]);
          }

          const endNodeText = endNode.getTextContent();
          if (end.offset === endNodeText.length) {
            getNextNodeText(endNode);
          } else {
            const text = endNode.getTextContent();
            spaceState.nextTextIsSpace = isSpace(text[end.offset]);
          }
        }
      }
    }
  }
  return spaceState;
};
