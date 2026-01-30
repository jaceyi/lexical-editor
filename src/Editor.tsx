import React, {
  CSSProperties,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  useImperativeHandle
} from 'react';
import { LexicalComposer, InitialConfigType } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { EditorRefPlugin } from '@lexical/react/LexicalEditorRefPlugin';
import { LinkPlugin as LexicalLinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { EditablePlugin } from './plugins/EditablePlugin';
import { ReadHTMLValuePlugin } from './plugins/ReadHTMLValuePlugin';
import { ToolbarPlugin } from './plugins/ToolbarPlugin';
import { ImagePlugin } from './plugins/ImagePlugin';
import { LinkPlugin as CustomLinkPlugin } from './plugins/LinkPlugin';
import { DragDropPastePlugin } from './plugins/DragDropPastePlugin';
import { KeywordsPlugin, KeywordsPluginProps } from './plugins/KeywordsPlugin';
import {
  MentionsPlugin,
  MentionsPluginProps,
  MentionsThemeClasses
} from './plugins/MentionsPlugin';
import { AutoFocusPlugin } from './plugins/AutoFocusPlugin';
import baseNodes from './nodes';
import { getHTMLConfig } from './utils/html';
import { $generateHtmlFromNodes } from '@lexical/html';
import classNames from 'classnames';
import { EditorState, LexicalEditor } from 'lexical';
import type { UploadFile } from './types';
import { EDITOR_CLASSNAME_NAMESPACE } from './utils/consts';
import type { EditorThemeClasses as LexicalEditorThemeClasses } from 'lexical/LexicalEditor';
import * as typeGuards from './utils/typeGuards';

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

export interface EditorRef {
  editor: LexicalEditor | null;
}

const defaultNodes: InitialConfigType['nodes'] = [];
const defaultConfig: EditorConfig = {};
const defaultTheme: EditorThemeClasses = {};

/**
 * Lexical 编辑器主组件
 * 提供 HTML 导入导出、插件加载及核心编辑功能。
 */
const Editor = React.forwardRef<EditorRef, EditorProps>(function Editor(
  {
    mode = 'html',
    namespace,
    isEditable = true,
    initialValue,
    value,
    onChange,
    autoFocus = true,
    placeholder = '请输入内容',
    nodes = defaultNodes,
    config = defaultConfig,
    theme = defaultTheme,
    className,
    style,
    contentStyle,
    children
  },
  ref
) {
  // 处理编辑器内容变更，导出 HTML
  const handleChange = useCallback(
    (_: EditorState, editor: LexicalEditor) => {
      // 如果正在进行组合输入，则不触发 onChange
      if (!editor.isComposing() && typeGuards.isFunction(onChange)) {
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

  const editorRef = useRef<LexicalEditor>(null);

  // 暴露编辑器实例给父组件
  useImperativeHandle(ref, () => ({
    editor: editorRef.current
  }));

  // 渲染提及插件
  const mentionsPluginNode = useMemo(() => {
    const mentions = config.mentions;
    if (!isEditable || !mentions) return null;
    if (Array.isArray(mentions)) {
      return <MentionsPlugin mentions={mentions} />;
    } else if (typeGuards.isObject(mentions)) {
      return <MentionsPlugin {...mentions} />;
    }
  }, [config.mentions, isEditable]);

  // 编辑器初始配置
  const initialConfig = useMemo(() => {
    return {
      namespace,
      editable: isEditable,
      onError: (error: Error) => {
        console.warn('Lexical Editor Error', error);
      },
      nodes: [...baseNodes, ...nodes],
      html: getHTMLConfig(),
      theme: {
        text: {
          bold: 'theme__textBold',
          italic: 'theme__textItalic',
          underline: 'theme__textUnderline'
        },
        textKeyword: 'theme__textKeyword',
        nodeImage: 'theme__nodeImage',
        nodeMention: 'theme__nodeMention',
        ...theme
      }
    };
  }, [namespace, isEditable, theme, nodes]);

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
        <LexicalComposer initialConfig={initialConfig}>
          {/* 插件列表 */}
          <EditablePlugin isEditable={isEditable} />
          {mode === 'html' && <ReadHTMLValuePlugin initialValue={initialValue} value={value} />}
          {isEditable ? <ToolbarPlugin config={config} /> : null}

          <div className="editor__main">
            <div className="editor__content">
              <RichTextPlugin
                contentEditable={
                  <ContentEditable className="editor__editable" style={contentStyle} />
                }
                placeholder={
                  isEditable ? <div className="editor__placeholder">{placeholder}</div> : null
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
            </div>
            {/* 核心插件 */}
            <OnChangePlugin onChange={handleChange} ignoreSelectionChange />
            <EditorRefPlugin editorRef={editorRef} />
            <AutoFocusPlugin autoFocus={autoFocus} />
            <HistoryPlugin />
            <ImagePlugin />
            <ListPlugin />
            {/* 官方链接插件：负责消费 TOGGLE_LINK_COMMAND，实现“更新/取消链接” */}
            <LexicalLinkPlugin />
            {/* 自定义链接插件：提供 INSERT_LINK_COMMAND 等扩展能力 */}
            <CustomLinkPlugin />
            {mentionsPluginNode}

            {/* 条件加载功能插件 */}
            {typeGuards.isFunction(config.onUploadFile) && (
              <DragDropPastePlugin onUploadFile={config.onUploadFile} />
            )}
            {(typeGuards.isArray<string>(config.keywords) ||
              typeGuards.isRegExp(config.keywords)) && (
              <KeywordsPlugin keywords={config.keywords} />
            )}
            {children}
          </div>
        </LexicalComposer>
      </div>
    </div>
  );
});

export default React.memo(Editor);
