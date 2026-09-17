/**
 * 正则转义工具：把使用者传入的触发字符、关键字当作字面量匹配，
 * 避免 `C++`、`(foo)` 这类内容被当成正则语法而报错或误匹配。
 */

/** 转义正则元字符，用于拼接普通匹配片段 */
export const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** 转义字符类（[]）内需要额外处理的字符，用于拼接 `[^ ...]` */
export const escapeRegExpClass = (value: string): string => value.replace(/[\\\]^-]/g, '\\$&');
