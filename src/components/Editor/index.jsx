import './style.scss';
import React from 'react';
import PropTypes from 'prop-types';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { ListItemNode, ListNode } from '@lexical/list';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';

import { ReadValuePlugin } from './plugins/ReadValuePlugin';
import { ToolbarPlugin } from './plugins/ToolbarPlugin';
import { ImagePlugin } from './plugins/ImagePlugin';
import DragDropPastePlugin from './plugins/DragDropPastePlugin';
import nodes from './nodes';

const Editor = ({ namespace, value, onChange, isEditable = true }) => {
  return (
    <div
      className={`editor-container ${isEditable ? 'editable' : 'no-editable'}`}
    >
      <LexicalComposer
        initialConfig={{
          namespace,
          onError: console.log,
          nodes: [ListItemNode, ListNode, ...nodes],
          theme: {
            image: 'theme_image',
            text: {
              bold: 'theme__textBold',
              italic: 'theme__textItalic'
            }
          }
        }}
      >
        <ReadValuePlugin value={value} isEditable={isEditable} />
        {isEditable && <ToolbarPlugin />}
        <div className="editor-main">
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor" />}
            placeholder={
              isEditable ? <div className="placeholder">请输入内容</div> : null
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <OnChangePlugin
            onChange={(_, editor) => onChange(editor)}
            ignoreSelectionChange
          />
          <HistoryPlugin />
          <ImagePlugin />
          <ListPlugin />
          <DragDropPastePlugin />
        </div>
      </LexicalComposer>
    </div>
  );
};

Editor.propTypes = {
  namespace: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func,
  isEditable: PropTypes.bool
};

export default React.memo(Editor);
