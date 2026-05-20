/**
 * Namespace for the editor classnames
 */
export const EDITOR_CLASSNAME_NAMESPACE = 'editor__root';

export const TOOLBAR_FEATURES = {
  BLOCK_FORMAT: 'blockFormat',
  BOLD: 'bold',
  ITALIC: 'italic',
  UNDERLINE: 'underline',
  STRIKETHROUGH: 'strikethrough',
  FONT_COLOR: 'fontColor',
  BACKGROUND_COLOR: 'backgroundColor',
  FORMAT_PAINTER: 'formatPainter',
  CLEAR_STYLE: 'clearStyle',
  FONT_FAMILY: 'fontFamily',
  FONT_SIZE: 'fontSize',
  BLOCK_ALIGN: 'blockAlign',
  LINK: 'link',
  MENTION: 'mention',
  FILE_UPLOAD: 'fileUpload'
} as const;

export type ToolbarFeatureKey = (typeof TOOLBAR_FEATURES)[keyof typeof TOOLBAR_FEATURES];
