import './style.scss';
import React from 'react';
import PropTypes from 'prop-types';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { ListNode, ListItemNode } from '@lexical/list';
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
import baseNodes from './nodes';

const Editor = ({
  namespace,
  isEditable = true,
  value,
  onChange,
  placeholder = '请输入内容',
  nodes = [],
  plugins = [],
  config = {}
}) => {
  return (
    <div
      className={`editor__container ${isEditable ? 'editable' : 'no-editable'}`}
    >
      <LexicalComposer
        initialConfig={{
          namespace,
          onError: console.log,
          nodes: [
            ListNode,
            ListItemNode,
            BeautifulMentionNode,
            ...baseNodes,
            ...nodes
          ],
          theme: {
            image: 'theme__image',
            file: 'theme__file',
            text: {
              bold: 'theme__textBold',
              italic: 'theme__textItalic',
              underline: 'theme__textUnderline',
              keyword: 'theme__textKeyword'
            },
            beautifulMentions: mentionsPluginTheme
          }
        }}
      >
        <ReadValuePlugin value={value} isEditable={isEditable} />
        {isEditable && <ToolbarPlugin onFileUpload={config.onFileUpload} />}
        <div className="editor__main">
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor__content" />}
            placeholder={
              isEditable ? (
                <div className="editor__placeholder">{placeholder}</div>
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
          <DragDropPastePlugin onFileUpload={config.onFileUpload} />
          <MentionsPlugin mentions={config.mentions} />
          <KeywordsPlugin keywords={config.keywords} />
          {plugins}
        </div>
      </LexicalComposer>
    </div>
  );
};

Editor.propTypes = {
  namespace: PropTypes.string.isRequired,
  isEditable: PropTypes.bool,
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  nodes: PropTypes.array,
  plugins: PropTypes.array,
  config: PropTypes.shape({
    onFileUpload: PropTypes.func,
    mentions: PropTypes.array,
    keyword: PropTypes.array
  })
};

export default React.memo(Editor);
