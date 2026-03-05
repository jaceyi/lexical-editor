import React, { useCallback, useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import { AUTO_INSERT_LINK_COMMAND } from '.';

interface LinkEditorProps {
  onConfirm: () => void;
  onCancel: () => void;
  linkUrl: string | null;
}

const DEFAULT_LINK_URL = 'https://';

export const LinkEditor: React.FC<LinkEditorProps> = ({ onConfirm, linkUrl }) => {
  const [editor] = useLexicalComposerContext();
  const [inputUrl, setInputUrl] = useState(DEFAULT_LINK_URL);

  useEffect(() => {
    editor.getEditorState().read(() => {
      setInputUrl(linkUrl ?? DEFAULT_LINK_URL);
    });
  }, [editor, linkUrl]);

  const handleConfirm = useCallback(() => {
    if (inputUrl && inputUrl !== DEFAULT_LINK_URL) {
      if (linkUrl) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, inputUrl);
      } else {
        editor.dispatchCommand(AUTO_INSERT_LINK_COMMAND, { url: inputUrl, title: inputUrl });
      }
      onConfirm();
      setInputUrl(DEFAULT_LINK_URL);
    }
  }, [editor, inputUrl, onConfirm, linkUrl]);

  const handleClear = useCallback(() => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    onConfirm();
    setInputUrl(DEFAULT_LINK_URL);
  }, [editor, onConfirm]);

  return (
    <div className="editor__linkEditor" onClick={e => e.stopPropagation()}>
      <div className="link-input-group">
        <label>链接地址</label>
        <input
          type="text"
          value={inputUrl}
          onChange={e => setInputUrl(e.target.value)}
          placeholder={DEFAULT_LINK_URL}
          autoFocus={linkUrl !== null}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              handleConfirm();
            }
          }}
        />
      </div>
      <div className="link-editor-actions">
        {linkUrl !== null && (
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
