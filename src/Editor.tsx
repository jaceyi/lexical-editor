import React, { CSSProperties, ReactNode, useCallback, useMemo } from 'react';
import {
  LexicalComposer,
  InitialConfigType
} from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { EditablePlugn } from './plugins/EditablePlugn';
import { ReadHTMLValuePlugin } from './plugins/ReadHTMLValuePlugin';
import { ToolbarPlugin } from './plugins/ToolbarPlugin';
import { ImagePlugin } from './plugins/ImagePlugin';
import { LinkPlugin } from './plugins/LinkPlugin';
import { DragDropPastePlugin } from './plugins/DragDropPastePlugin';
import { KeywordsPlugin, KeywordsPluginProps } from './plugins/KeywordsPlugin';
import {
  MentionsPlugin,
  MentionsPluginProps,
  MentionsThemeClasses
} from './plugins/MentionsPlugin';
import { AutoFocusPlugin } from './plugins/AutoFocusPlugin';
import baseNodes from './nodes';
import { $generateHtmlFromNodes } from '@lexical/html';
import classNames from 'classnames';
import { EditorState, LexicalEditor } from 'lexical';
import type { UploadFile } from './types';
import { EDITOR_CLASSNAME_NAMESPACE } from './utils/consts';
import type { EditorThemeClasses as LexicalEditorThemeClasses } from 'lexical/LexicalEditor';

export interface EditorConfig {
  onUploadFile?: UploadFile;
  mentions?: MentionsPluginProps['mentions'] | MentionsPluginProps;
  keywords?: KeywordsPluginProps['keywords'];
}

export type EditorThemeClasses = LexicalEditorThemeClasses & {
  mentions?: MentionsThemeClasses;
};

export interface EditorProps {
  mode?: 'html';
  namespace: string;
  isEditable?: boolean;
  initialValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  autoFocus?: boolean;
  placeholder?: string;
  nodes?: InitialConfigType['nodes'];
  config?: EditorConfig;
  theme?: EditorThemeClasses;
  className?: string;
  style?: CSSProperties;
  contentStyle?: CSSProperties;
  children?: ReactNode;
}

const Editor: React.FC<EditorProps> = ({
  mode = 'html',
  namespace,
  isEditable = true,
  initialValue,
  value,
  onChange,
  autoFocus = true,
  placeholder = '请输入内容',
  nodes = [],
  config = {},
  theme = {},
  className,
  style,
  contentStyle,
  children
}) => {
  const handleChange = useCallback(
    (_: EditorState, editor: LexicalEditor) => {
      if (typeof onChange === 'function') {
        if (mode === 'html') {
          editor.update(() => {
            const html = $generateHtmlFromNodes(editor, null);
            onChange(html);
          });
        }
      }
    },
    [mode, onChange]
  );

  const { text, mentions, ...themeRest } = theme;

  return (
    <div className={EDITOR_CLASSNAME_NAMESPACE}>
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
            editable: isEditable,
            onError: console.log,
            nodes: [...baseNodes, ...nodes],
            theme: {
              text: {
                bold: 'theme__textBold',
                italic: 'theme__textItalic',
                underline: 'theme__textUnderline',
                ...text
              },
              image: 'theme__image',
              keyword: 'theme__textKeyword',
              mentions: {
                container: 'theme__mentionsContainer',
                menu: 'theme__mentionsMenu',
                menuItem: 'theme__mentionsMenuItem',
                menuItemSelected: 'theme__mentionsMenuItemSelected',
                ...mentions
              },
              ...themeRest
            }
          }}
        >
          <EditablePlugn isEditable={isEditable} />
          {mode === 'html' && (
            <ReadHTMLValuePlugin initialValue={initialValue} value={value} />
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
            <AutoFocusPlugin autoFocus={autoFocus} />
            <HistoryPlugin />
            <ImagePlugin />
            <ListPlugin />
            <LinkPlugin />
            {useMemo(() => {
              const { mentions } = config;
              if (!isEditable || !mentions) return null;
              if (Array.isArray(mentions)) {
                return <MentionsPlugin mentions={mentions} />;
              } else if (typeof mentions === 'object') {
                return <MentionsPlugin {...mentions} />;
              }
              // eslint-disable-next-line react-hooks/exhaustive-deps
            }, [isEditable, config.mentions])}
            {config.onUploadFile !== undefined && (
              <DragDropPastePlugin onUploadFile={config.onUploadFile} />
            )}
            {config.keywords !== undefined && (
              <KeywordsPlugin keywords={config.keywords} />
            )}
            {children}
          </div>
        </LexicalComposer>
      </div>
    </div>
  );
};

export default React.memo(Editor);
