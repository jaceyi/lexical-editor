import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Dropdown from '@rc-component/dropdown';
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  NodeKey
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { useLexicalEditable } from '@lexical/react/useLexicalEditable';
import { mergeRegister } from '@lexical/utils';
import { CloseOutlined, DownloadOutlined, EditOutlined } from '../../icons';
import { usePopupContainer } from '../../hooks/usePopupContainer';
import { useLocale } from '../../locale';
import { useDraggable } from '../../plugins/DraggableNodePlugin/useDraggable';
import { $isFileNode, $updateFileName } from './index';

export interface FileComponentProps {
  nodeKey: NodeKey;
  url: string;
  name: string;
}

const getFileExtension = (name: string): string => {
  const [, extension] = /\.([^.]+)$/.exec(name) ?? [];
  return extension ? extension.slice(0, 5).toUpperCase() : 'FILE';
};

export const FileComponent: React.FC<FileComponentProps> = ({ nodeKey, url, name }) => {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const locale = useLocale();
  const { getPopupContainer } = usePopupContainer();
  // 订阅可编辑状态，运行期切换 setEditable 时按钮会同步显隐
  const isEditable = useLexicalEditable();
  const nodeRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [inputName, setInputName] = useState(name);
  const dragProps = useDraggable(nodeKey);

  useEffect(() => {
    if (renameOpen) {
      setInputName(name);
      window.setTimeout(() => inputRef.current?.select(), 0);
    }
  }, [name, renameOpen]);

  const removeFile = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isFileNode(node)) {
        node.remove();
      }
    });
  }, [editor, nodeKey]);

  const downloadFile = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
    [name, url]
  );

  const renameFile = useCallback(() => {
    const nextName = inputName.trim();
    if (!nextName || nextName === name) return;
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isFileNode(node)) {
        $updateFileName(node, nextName);
      }
    });
    setRenameOpen(false);
  }, [editor, inputName, name, nodeKey]);

  const renameOverlay = useMemo(
    () => (
      <div
        className="theme__nodeFileRename"
        onClick={event => event.stopPropagation()}
        onMouseDown={event => event.stopPropagation()}
      >
        <div className="theme__nodeFileRenameTitle">{locale.renameFile}</div>
        <div className="theme__nodeFileRenameRow">
          <input
            ref={inputRef}
            value={inputName}
            placeholder={locale.renameFilePlaceholder}
            aria-label={locale.renameFile}
            onChange={event => setInputName(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault();
                renameFile();
              } else if (event.key === 'Escape') {
                setRenameOpen(false);
              }
            }}
          />
          <button type="button" onClick={renameFile}>
            {locale.confirm}
          </button>
        </div>
      </div>
    ),
    [inputName, locale.confirm, locale.renameFile, locale.renameFilePlaceholder, renameFile]
  );

  const onDelete = useCallback(
    (payload: KeyboardEvent) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        payload.preventDefault();
        removeFile();
        return true;
      }
      return false;
    },
    [isSelected, removeFile]
  );

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        CLICK_COMMAND,
        event => {
          const target = event.target as Node;
          if (!nodeRef.current?.contains(target)) return false;
          // 点击下载/重命名/删除按钮时不改变选中状态
          if (target instanceof Element && target.closest('button')) return false;

          if (event.shiftKey) {
            setSelected(!isSelected);
          } else {
            clearSelection();
            setSelected(true);
          }
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(KEY_DELETE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_BACKSPACE_COMMAND, onDelete, COMMAND_PRIORITY_LOW)
    );
  }, [clearSelection, editor, isSelected, onDelete, setSelected]);

  return (
    <span
      ref={nodeRef}
      {...dragProps}
      className={`theme__nodeFileContent${
        isSelected || renameOpen ? ' theme__nodeFileContent_selected' : ''
      }`}
    >
      <span className="theme__nodeFileLink" title={name}>
        <span className="theme__nodeFileExt">{getFileExtension(name)}</span>
        <span className="theme__nodeFileName">{name}</span>
      </span>
      <span className="theme__nodeFileActions" onDragStart={event => event.stopPropagation()}>
        <button
          type="button"
          title={locale.downloadFile}
          aria-label={locale.downloadFile}
          onClick={downloadFile}
        >
          <DownloadOutlined />
        </button>
        {isEditable && (
          <>
            <Dropdown
              getPopupContainer={getPopupContainer}
              trigger={['click']}
              open={renameOpen}
              onOpenChange={setRenameOpen}
              overlay={renameOverlay}
            >
              <button
                type="button"
                title={locale.renameFile}
                aria-label={locale.renameFile}
                onClick={event => {
                  event.preventDefault();
                  event.stopPropagation();
                  setRenameOpen(true);
                }}
              >
                <EditOutlined />
              </button>
            </Dropdown>
            <button
              type="button"
              title={locale.deleteFile}
              aria-label={locale.deleteFile}
              onClick={event => {
                event.preventDefault();
                event.stopPropagation();
                removeFile();
              }}
            >
              <CloseOutlined />
            </button>
          </>
        )}
      </span>
    </span>
  );
};
