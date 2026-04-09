export const isObject = (value: unknown): value is Record<string, unknown> => {
  if (value === null) return false;
  return typeof value === 'object';
};

export const isFunction = (value: unknown): value is (...args: any[]) => any => {
  return typeof value === 'function';
};

export const isArray = <T = unknown>(value: unknown): value is T[] => {
  return Array.isArray(value);
};

export const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

export const isNumber = (value: unknown): value is number => {
  return typeof value === 'number';
};

export const isBoolean = (value: unknown): value is boolean => {
  return typeof value === 'boolean';
};

export const isNil = (value: unknown): value is null | undefined => {
  return value === null || value === undefined;
};

export const isRegExp = (value: unknown): value is RegExp => {
  return value instanceof RegExp;
};
