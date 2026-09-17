import React, { ReactNode, useCallback, useMemo, useRef, useImperativeHandle } from 'react';
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
import { ReadJSONValuePlugin } from './plugins/ReadJSONValuePlugin';
import { ToolbarPlugin } from './plugins/ToolbarPlugin';
import { FilePlugin } from './plugins/FilePlugin';
import { ImagePlugin } from './plugins/ImagePlugin';
import { LinkPlugin as CustomLinkPlugin } from './plugins/LinkPlugin';
import { DragDropPastePlugin } from './plugins/DragDropPastePlugin';
import { DraggableNodePlugin } from './plugins/DraggableNodePlugin';
import { KeywordsPlugin, KeywordsPluginProps } from './plugins/KeywordsPlugin';
import {
  MentionsPlugin,
  MentionsPluginProps,
  MentionsThemeClasses
} from './plugins/MentionsPlugin';
import { AutoFocusPlugin } from './plugins/AutoFocusPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import baseNodes from './nodes';
import { getHTMLConfig } from './utils/html';
import { $generateHtmlFromNodes } from '@lexical/html';
import clsx from 'clsx';
import { EditorState, LexicalEditor } from 'lexical';
import type { UploadFile } from './types';
import { EDITOR_CLASSNAME_NAMESPACE, type ToolbarFeatureKey } from './utils/consts';
import type { EditorThemeClasses as LexicalEditorThemeClasses } from 'lexical';
import * as typeGuards from './utils/typeGuards';
import { LocaleContext } from './locale/LocaleContext';
import { zhCN, enUS } from './locale';
import type { Locale, LocaleKey } from './locale/types';

export interface EditorConfig {
  onUploadFile?: UploadFile;
  mentions?: MentionsPluginProps['mentions'] | MentionsPluginProps;
  keywords?: KeywordsPluginProps['keywords'];
  toolbar?: ToolbarFeatureKey[] | false;
}

export type EditorThemeClasses = LexicalEditorThemeClasses & {
  mentions?: MentionsThemeClasses;
};

export type EditorThemeMode = 'light' | 'dark';

export interface EditorProps {
  namespace: string;
  isEditable?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  nodes?: InitialConfigType['nodes'];
  config?: EditorConfig;
  theme?: EditorThemeClasses;
  themeMode?: EditorThemeMode;
  locale?: LocaleKey | Partial<Locale>;
  className?: string;
  children?: ReactNode;
}

export type EditorJSONValue = Record<string, unknown>;

export type EditorHTMLProps = EditorProps & {
  mode?: 'html';
  initialValue?: string;
  value?: string;
  onChange?: (value: string) => void;
};

export type EditorJSONProps = EditorProps & {
  mode: 'json';
  initialValue?: string | EditorJSONValue;
  value?: string | EditorJSONValue;
  onChange?: (value: EditorJSONValue) => void;
};

export type EditorAllProps = EditorHTMLProps | EditorJSONProps;

export interface EditorRef {
  editor: LexicalEditor | null;
}

const defaultNodes: InitialConfigType['nodes'] = [];
const defaultConfig: EditorConfig = {};
const defaultTheme: EditorThemeClasses = {};

const defaultThemeClasses = {
  text: {
    bold: 'theme__textBold',
    italic: 'theme__textItalic',
    underline: 'theme__textUnderline',
    strikethrough: 'theme__textStrikethrough',
    underlineStrikethrough: 'theme__textUnderlineStrikethrough'
  },
  textKeyword: 'theme__textKeyword',
  nodeFile: 'theme__nodeFile',
  nodeImage: 'theme__nodeImage',
  nodeMention: 'theme__nodeMention',
  list: {
    listitem: 'theme__listItem',
    listitemChecked: 'theme__listItemChecked',
    listitemUnchecked: 'theme__listItemUnchecked',
    nested: {
      listitem: 'theme__nestedListItem'
    },
    olDepth: ['theme__ol1', 'theme__ol2', 'theme__ol3', 'theme__ol4', 'theme__ol5'],
    ul: 'theme__ul'
  }
};

const defaultThemeMode: EditorThemeMode = 'light';
const defaultLocale: LocaleKey = 'zh-CN';

const localeMap: Record<string, Locale> = { 'zh-CN': zhCN, 'en-US': enUS };

/**
 * 编辑器主组件：装配节点、插件与主题，按 html/json 两种模式同步内容。
 */
const Editor = React.forwardRef<EditorRef, EditorAllProps>(function Editor(
  {
    mode = 'html',
    namespace,
    isEditable = true,
    initialValue,
    value,
    onChange,
    autoFocus = true,
    placeholder,
    nodes = defaultNodes,
    config = defaultConfig,
    theme = defaultTheme,
    themeMode = defaultThemeMode,
    locale = defaultLocale,
    className,
    children
  },
  ref
) {
  // 自定义语言包按 Key 覆盖默认语言（zh-CN），未提供的 Key 使用默认文案
  const resolvedLocale =
    typeof locale === 'string' ? (localeMap[locale] ?? zhCN) : { ...zhCN, ...locale };
  const resolvedPlaceholder = placeholder ?? resolvedLocale.placeholder;
  const handleChange = useCallback(
    (_: EditorState, editor: LexicalEditor) => {
      // 如果正在进行组合输入，则不触发 onChange
      if (!editor.isComposing() && typeGuards.isFunction(onChange)) {
        if (mode === 'html') {
          const htmlOnChange = onChange as EditorHTMLProps['onChange'];
          editor.update(() => {
            const html = $generateHtmlFromNodes(editor, null);
            htmlOnChange?.(html);
          });
        } else if (mode === 'json') {
          const jsonOnChange = onChange as EditorJSONProps['onChange'];
          jsonOnChange?.(editor.getEditorState().toJSON() as unknown as EditorJSONValue);
        }
      }
    },
    [mode, onChange]
  );

  const editorRef = useRef<LexicalEditor>(null);

  useImperativeHandle(ref, () => ({
    editor: editorRef.current
  }));

  // 未配置提及或只读态下不挂载提及插件
  const mentionsPluginNode = useMemo(() => {
    const mentions = config.mentions;
    if (!isEditable || !mentions) return null;
    if (Array.isArray(mentions)) {
      return <MentionsPlugin mentions={mentions} />;
    } else if (typeGuards.isObject(mentions)) {
      return <MentionsPlugin {...mentions} />;
    }
  }, [config.mentions, isEditable]);

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
        ...defaultThemeClasses,
        ...theme,
        // text 与 list 是嵌套对象，逐层合并，避免使用方只覆盖其中一个 class 就丢掉其余默认值
        text: { ...defaultThemeClasses.text, ...theme?.text },
        list: {
          ...defaultThemeClasses.list,
          ...theme?.list,
          nested: { ...defaultThemeClasses.list.nested, ...theme?.list?.nested }
        }
      }
    };
  }, [namespace, isEditable, theme, nodes]);

  return (
    <LocaleContext.Provider value={resolvedLocale}>
      <div className={EDITOR_CLASSNAME_NAMESPACE} data-lexical-theme={themeMode}>
        <div
          className={clsx(
            'editor__container',
            `editor__${isEditable ? 'editable' : 'readonly'}`,
            className
          )}
        >
          <LexicalComposer initialConfig={initialConfig}>
            {isEditable && config.toolbar !== false ? (
              <ToolbarPlugin
                config={{ ...config, toolbar: config.toolbar as ToolbarFeatureKey[] | undefined }}
              />
            ) : null}
            <div className="editor__main">
              <RichTextPlugin
                contentEditable={<ContentEditable className="editor__content" />}
                placeholder={
                  isEditable ? (
                    <div className="editor__placeholder">{resolvedPlaceholder}</div>
                  ) : null
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
            </div>
            <EditablePlugin isEditable={isEditable} />
            <OnChangePlugin onChange={handleChange} ignoreSelectionChange />
            <EditorRefPlugin editorRef={editorRef} />
            <AutoFocusPlugin autoFocus={autoFocus} />
            <HistoryPlugin />
            <DraggableNodePlugin />
            <FilePlugin />
            <ImagePlugin />
            <ListPlugin />
            <CheckListPlugin />
            {mode === 'html' && (
              <ReadHTMLValuePlugin initialValue={initialValue as string} value={value as string} />
            )}
            {mode === 'json' && (
              <ReadJSONValuePlugin
                initialValue={initialValue as EditorJSONValue}
                value={value as EditorJSONValue}
              />
            )}
            {/* 官方链接插件：消费 TOGGLE_LINK_COMMAND，实现“更新/取消链接” */}
            <LexicalLinkPlugin />
            {/* 自定义链接插件：提供 INSERT_LINK_COMMAND 等扩展能力 */}
            <CustomLinkPlugin />
            {mentionsPluginNode}
            {typeGuards.isFunction(config.onUploadFile) && (
              <DragDropPastePlugin onUploadFile={config.onUploadFile} />
            )}
            {(typeGuards.isArray<string>(config.keywords) ||
              typeGuards.isRegExp(config.keywords)) && (
              <KeywordsPlugin keywords={config.keywords} />
            )}
            {children}
          </LexicalComposer>
        </div>
      </div>
    </LocaleContext.Provider>
  );
});

export default React.memo(Editor);
