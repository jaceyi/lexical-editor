import React, { useCallback, useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import { AUTO_INSERT_LINK_COMMAND } from '.';

/**
 * 链接编辑器组件属性
 * @param onConfirm 确认提交后的回调
 * @param onCancel 取消操作的回调
 * @param isLink 是否是链接
 */
interface LinkEditorProps {
  onConfirm: () => void;
  onCancel: () => void;
  linkData: {
    isLink: boolean;
    url: string | null;
  };
}

const DEFAULT_LINK_URL = 'https://';

export const LinkEditor: React.FC<LinkEditorProps> = ({ onConfirm, linkData }) => {
  const [editor] = useLexicalComposerContext();
  const [linkUrl, setLinkUrl] = useState(DEFAULT_LINK_URL);

  // 初始化选区信息
  useEffect(() => {
    editor.getEditorState().read(() => {
      if (linkData.isLink && linkData.url) {
        setLinkUrl(linkData.url);
      } else {
        setLinkUrl(DEFAULT_LINK_URL);
      }
    });
  }, [editor, linkData.isLink, linkData.url]);

  const handleConfirm = useCallback(() => {
    if (linkUrl && linkUrl !== DEFAULT_LINK_URL) {
      // 如果已经是链接，我们使用 TOGGLE_LINK_COMMAND 来更新它，而不是插入新节点
      if (linkData.isLink) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
      } else {
        editor.dispatchCommand(AUTO_INSERT_LINK_COMMAND, { url: linkUrl, title: linkUrl });
      }
      onConfirm();
      setLinkUrl(DEFAULT_LINK_URL);
    }
  }, [editor, linkUrl, onConfirm, linkData.isLink]);

  const handleClear = useCallback(() => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    onConfirm();
    setLinkUrl(DEFAULT_LINK_URL);
  }, [editor, onConfirm]);

  return (
    <div className="editor__linkEditor" onClick={e => e.stopPropagation()}>
      <div className="link-input-group">
        <label>链接地址</label>
        <input
          type="text"
          value={linkUrl}
          onChange={e => setLinkUrl(e.target.value)}
          placeholder={DEFAULT_LINK_URL}
          autoFocus={linkData.isLink}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              handleConfirm();
            }
          }}
        />
      </div>
      <div className="link-editor-actions">
        {linkData.isLink && (
          <button type="button" className="cancel" onClick={handleClear}>
            取消链接
          </button>
        )}
        <button type="button" className="confirm" onClick={handleConfirm}>
          确认
        </button>
      </div>
    </div>
  );
};
