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
import { BeautifulMentionNode } from 'lexical-beautiful-mentions';

import { ReadValuePlugin } from './plugins/ReadValuePlugin';
import { ToolbarPlugin } from './plugins/ToolbarPlugin';
import { ImagePlugin } from './plugins/ImagePlugin';
import { FilePlugin } from './plugins/FilePlugin';
import { MentionsPlugin, mentionsPluginTheme } from './plugins/MentionsPlugin';
import { DragDropPastePlugin } from './plugins/DragDropPastePlugin';
import { KeywordsPlugin } from './plugins/KeywordsPlugin';
import nodes from './nodes';

const Editor = ({
  namespace,
  value,
  onChange,
  uploadFile,
  isEditable = true
}) => {
  return (
    <div
      className={`editor__container ${isEditable ? 'editable' : 'no-editable'}`}
    >
      <LexicalComposer
        initialConfig={{
          namespace,
          onError: console.log,
          nodes: [BeautifulMentionNode, ListItemNode, ListNode, ...nodes],
          theme: {
            image: 'theme__image',
            file: 'theme__file',
            text: {
              bold: 'theme__textBold',
              italic: 'theme__textItalic',
              keyword: 'theme__textKeyword'
            },
            beautifulMentions: mentionsPluginTheme
          }
        }}
      >
        <ReadValuePlugin value={value} isEditable={isEditable} />
        {isEditable && <ToolbarPlugin uploadFile={uploadFile} />}
        <div className="editor__main">
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor__content" />}
            placeholder={
              isEditable ? (
                <div className="editor__placeholder">请输入内容</div>
              ) : null
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <OnChangePlugin
            onChange={(_, editor) => onChange(editor)}
            ignoreSelectionChange
          />
          <HistoryPlugin />
          <ImagePlugin />
          <FilePlugin />
          <ListPlugin />
          <DragDropPastePlugin uploadFile={uploadFile} />
          <MentionsPlugin mentionsItems={['Jace', 'Hean']} />
          <KeywordsPlugin />
        </div>
      </LexicalComposer>
    </div>
  );
};

Editor.propTypes = {
  namespace: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func,
  uploadFile: PropTypes.func,
  isEditable: PropTypes.bool
};

export default React.memo(Editor);
