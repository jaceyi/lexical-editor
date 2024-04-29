import './style.scss';
import React from 'react';
import PropTypes from 'prop-types';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { ListNode, ListItemNode } from '@lexical/list';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { BeautifulMentionNode } from 'lexical-beautiful-mentions';
import { EditablePlugn } from './plugins/EditablePlugn';
import { ReadHTMLValuePlugin } from './plugins/ReadHTMLValuePlugin';
import { ToolbarPlugin } from './plugins/ToolbarPlugin';
import { ImagePlugin } from './plugins/ImagePlugin';
import { FilePlugin } from './plugins/FilePlugin';
import { ConnectEditorPlugin } from './plugins/ConnectEditorPlugin';
import { MentionsPlugin, mentionsPluginTheme } from './plugins/MentionsPlugin';
import { DragDropPastePlugin } from './plugins/DragDropPastePlugin';
import { KeywordsPlugin } from './plugins/KeywordsPlugin';
import baseNodes from './nodes';
import { FilterWithProps } from './components';
import { $generateHtmlFromNodes } from '@lexical/html';
import classNames from 'classnames';

const LexicalEditor = ({
  mode = 'html',
  namespace,
  isEditable = true,
  initialValue,
  value,
  onChange,
  forceUpdateValueKey,
  autoFocus = true,
  placeholder = '请输入内容',
  nodes = [],
  plugins = [],
  config = {},
  className,
  style,
  contentStyle
}) => {
  const handleChange = (_, editor) => {
    if (typeof onChange === 'function') {
      if (mode === 'html') {
        editor.update(() => {
          const html = $generateHtmlFromNodes(editor, null);
          onChange(html);
        });
      } else {
        onChange(editor);
      }
    }
  };
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
            text: {
              bold: 'theme__textBold',
              italic: 'theme__textItalic',
              underline: 'theme__textUnderline'
            },
            beautifulMentions: mentionsPluginTheme
          }
        }}
      >
        <EditablePlugn isEditable={isEditable} />
        {mode === 'html' && (
          <ReadHTMLValuePlugin
            initialValue={initialValue}
            value={value}
            forceUpdateValueKey={forceUpdateValueKey}
          />
        )}
        {isEditable ? <ToolbarPlugin config={config} /> : null}
        <div className="editor__main">
          <div className="editor__content">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className="editor__editable"
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
          </div>
          <OnChangePlugin onChange={handleChange} ignoreSelectionChange />
          {autoFocus && <AutoFocusPlugin />}
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
          <ConnectEditorPlugin plugins={plugins} />
        </div>
      </LexicalComposer>
    </div>
  );
};

LexicalEditor.propTypes = {
  mode: PropTypes.oneOf(['html']),
  namespace: PropTypes.string.isRequired,
  isEditable: PropTypes.bool,
  initialValue: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onChange: PropTypes.func,
  forceUpdateValueKey: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  autoFocus: PropTypes.bool,
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

export default React.memo(LexicalEditor);
