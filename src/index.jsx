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
import { FilterWithProps } from './components';
import { $generateHtmlFromNodes } from '@lexical/html';
import classNames from 'classnames';

const Editor = ({
  namespace,
  isEditable = true,
  initialValue,
  value,
  onChange,
  onChangeHtml,
  placeholder = '请输入内容',
  nodes = [],
  plugins = [],
  config = {},
  className,
  style,
  contentStyle
}) => {
  console.log('render');

  return (
    <div
      className={classNames(
        'editor__container',
        isEditable ? 'editable' : 'no-editable',
        className
      )}
      style={style}
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
            keyword: 'theme__textKeyword',
            beautifulMentions: mentionsPluginTheme
          }
        }}
      >
        <ReadValuePlugin
          initialValue={initialValue}
          value={value}
          isEditable={isEditable}
        />
        {isEditable && <ToolbarPlugin onFileUpload={config.onFileUpload} />}
        <div className="editor__main">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="editor__content"
                style={contentStyle}
              />
            }
            placeholder={
              isEditable ? (
                <div className="editor__placeholder">{placeholder}</div>
              ) : null
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <OnChangePlugin
            onChange={(_, editor) => {
              typeof onChange === 'function' && onChange(editor);

              if (typeof onChangeHtml === 'function') {
                editor.update(() => {
                  const html = $generateHtmlFromNodes(editor, null);
                  onChangeHtml(html);
                });
              }
            }}
            ignoreSelectionChange
          />
          <HistoryPlugin />
          <ImagePlugin />
          <FilePlugin />
          <ListPlugin />
          <FilterWithProps>
            <DragDropPastePlugin onFileUpload={config.onFileUpload} />
          </FilterWithProps>
          <FilterWithProps>
            <MentionsPlugin mentions={config.mentions} />
          </FilterWithProps>
          <FilterWithProps>
            <KeywordsPlugin keywords={config.keywords} />
          </FilterWithProps>
          {plugins}
        </div>
      </LexicalComposer>
    </div>
  );
};

Editor.propTypes = {
  namespace: PropTypes.string.isRequired,
  isEditable: PropTypes.bool,
  initialValue: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onChangeHtml: PropTypes.func,
  placeholder: PropTypes.string,
  nodes: PropTypes.array,
  plugins: PropTypes.array,
  config: PropTypes.shape({
    onFileUpload: PropTypes.func,
    mentions: PropTypes.array,
    keyword: PropTypes.array
  }),
  className: PropTypes.string,
  style: PropTypes.object,
  contentStyle: PropTypes.object
};

export default React.memo(Editor);
