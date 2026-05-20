export interface Locale {
  // Editor
  placeholder: string;

  // Toolbar titles
  bold: string;
  italic: string;
  underline: string;
  strikethrough: string;
  fontColor: string;
  backgroundColor: string;
  formatPainter: string;
  formatPainterHint: string;
  clearStyle: string;
  mention: string;
  fileUpload: string;
  hyperlink: string;

  // Block format
  blockType: string;
  paragraph: string;
  heading1: string;
  heading2: string;
  heading3: string;
  heading4: string;
  orderedList: string;
  unorderedList: string;
  checkList: string;
  quoteBlock: string;

  // Block align
  alignment: string;
  alignLeft: string;
  alignCenter: string;
  alignRight: string;
  alignJustify: string;

  // Font
  fontFamily: string;
  fontDefault: string;
  fontSimHei: string;
  fontSimSun: string;
  fontKaiTi: string;
  fontYuanTi: string;
  fontMonospace: string;
  fontSize: string;

  // Color picker
  clearColor: string;

  // Link editor
  linkAddress: string;
  removeLink: string;
  confirm: string;
}

export type LocaleKey = 'zh-CN' | 'en-US';
