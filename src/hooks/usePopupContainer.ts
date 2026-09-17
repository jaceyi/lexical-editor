import { useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { EDITOR_CLASSNAME_NAMESPACE } from '../utils/consts';

/** 从 element 向上找到第一个带编辑器命名空间的祖先元素 */
const findParentElement = (element: HTMLElement): HTMLElement => {
  if (!element.parentElement || element === document.body) {
    return element;
  }
  if (element.parentElement.classList.contains(EDITOR_CLASSNAME_NAMESPACE)) {
    return element.parentElement;
  }
  return findParentElement(element.parentElement);
};

/**
 * 获取当前编辑器实例对应的弹层挂载节点。
 * 多实例场景下必须使用当前 editor 的 root，避免错误挂载到其他实例。
 */
export const usePopupContainer = () => {
  const [editor] = useLexicalComposerContext();
  const getPopupContainer = useCallback(() => {
    const rootElement = editor.getRootElement();
    if (rootElement) {
      return findParentElement(rootElement);
    }
    return document.body;
  }, [editor]);
  return { getPopupContainer };
};
