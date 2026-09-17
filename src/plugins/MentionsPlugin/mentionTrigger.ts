import { escapeRegExp, escapeRegExpClass } from '../../utils/regex';

export interface MentionTriggerMatch {
  /** 命中的触发字符 */
  trigger: string;
  /** 触发字符之后的查询词 */
  query: string;
  /** 触发字符在文本中的偏移，用于定位菜单锚点与替换范围 */
  leadOffset: number;
  /** 需要被替换掉的文本（触发字符 + 查询词） */
  matchingString: string;
}

/**
 * 构造提及触发的匹配正则。
 * 触发字符可以出现在文本任意位置（紧跟文字、紧跟提及都行），不要求前面是空格或行首；
 * 查询词中不允许出现空格与触发字符。
 */
export const createMentionTriggerRegex = (
  trigger: string | string[],
  validCharsLength: number
): RegExp => {
  const triggers = Array.isArray(trigger) ? trigger : [trigger];
  // 触发字符按字面量转义后再拼成或分支 / 字符类，避免 `.`、`*` 等特殊字符破坏规则
  const triggerPattern = triggers.map(escapeRegExp).join('|');
  const triggerChars = triggers.map(escapeRegExpClass).join('');
  return new RegExp(`(${triggerPattern})((?:[^ ${triggerChars}\\s]){0,${validCharsLength}})$`);
};

export const getMentionTriggerMatch = (regex: RegExp, text: string): MentionTriggerMatch | null => {
  const match = regex.exec(text);
  if (!match) return null;
  const [, trigger, query] = match;
  return {
    trigger,
    query,
    leadOffset: match.index,
    matchingString: trigger + query
  };
};
