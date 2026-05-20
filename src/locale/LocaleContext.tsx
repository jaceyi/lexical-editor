import { createContext, useContext } from 'react';
import type { Locale } from './types';
import { zhCN } from './zh-CN';

export const LocaleContext = createContext<Locale>(zhCN);

export function useLocale(): Locale {
  return useContext(LocaleContext);
}
