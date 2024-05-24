import React, { CSSProperties } from 'react';
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
import {
  MentionsPlugin,
  mentionsPluginTheme,
  MentionsPluginProps
} from './plugins/MentionsPlugin';
import { DragDropPastePlugin } from './plugins/DragDropPastePlugin';
import { KeywordsPlugin, KeywordsPluginProps } from './plugins/KeywordsPlugin';
import baseNodes from './nodes';
import { $generateHtmlFromNodes } from '@lexical/html';
import classNames from 'classnames';
import { EditorState, LexicalEditor } from 'lexical';

export interface EditorConfig {
  onFileUpload?: (file: File) => Promise<{ url: string; name: string }>;
  mentions?: MentionsPluginProps['mentions'];
  keywords?: KeywordsPluginProps['keywords'];
}

export interface EditorProps {
  mode?: 'html';
  namespace: string;
  isEditable?: boolean;
  initialValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  forceUpdateValueKey?: string | number;
  autoFocus?: boolean;
  placeholder?: string;
  nodes?: any[];
  plugins?: any[];
  config?: EditorConfig;
  className?: string;
  style?: CSSProperties;
  contentStyle?: CSSProperties;
}

const Editor: React.FC<EditorProps> = ({
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
  const handleChange = (_: EditorState, editor: LexicalEditor) => {
    if (typeof onChange === 'function') {
      if (mode === 'html') {
        editor.update(() => {
          const html = $generateHtmlFromNodes(editor, null);
          onChange(html);
        });
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
          <MentionsPlugin mentions={config.mentions} />
          {config.onFileUpload !== undefined && (
            <DragDropPastePlugin onFileUpload={config.onFileUpload} />
          )}
          {config.keywords !== undefined && (
            <KeywordsPlugin keywords={config.keywords} />
          )}
          <ConnectEditorPlugin plugins={plugins} />
        </div>
      </LexicalComposer>
    </div>
  );
};

export default React.memo(Editor);
