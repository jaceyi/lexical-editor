import React from 'react';
import ReactDOM from 'react-dom';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalTypeaheadMenuPlugin } from '@lexical/react/LexicalTypeaheadMenuPlugin';
import { TextNode } from 'lexical';
import { useCallback, useMemo, useState } from 'react';
import { $createMentionNode } from '../../nodes/MentionNode';
import { EDITOR_CLASSNAME_NAMESPACE } from '../../utils/consts';
import * as typeGuards from '../../utils/typeGuards';
import { List, ListItem } from '../../ui/List';
import { MentionOption, MentionItem } from './MentionOption';

export interface MentionsThemeClasses {
  container?: string;
  menu?: string;
  menuItem?: string;
  menuItemSelected?: string;
}

export interface MentionsPluginProps {
  mentions?: MentionItem[];
  trigger?: string | string[];
  validCharsLength?: number;
  suggestionListLength?: number;
}

/**
 * 提及（Mentions）插件：支持 @ 功能
 * 方法核心逻辑：使用 LexicalTypeaheadMenuPlugin 监听输入，匹配正则后展示列表。
 * 自定义 List 渲染：使用项目自实现的 List 组件替代外部 UI 库。
 */
export const MentionsPlugin: React.FC<MentionsPluginProps> = ({
  mentions = [],
  trigger = '@',
  validCharsLength = 50,
  suggestionListLength = 5
}) => {
  const _trigger = Array.isArray(trigger) ? trigger.join('|') : trigger;
  const AtMentionsRegex = useMemo(
    () => new RegExp(`(^|\\s)(${_trigger})((?:[^ ${_trigger}\\s]){0,${validCharsLength}})$`),
    [_trigger, validCharsLength]
  );

  const [editor] = useLexicalComposerContext();

  const [queryString, setQueryString] = useState<string | null>(null);

  const options = useMemo(() => {
    if (!mentions.length || !queryString) return [];
    const match = AtMentionsRegex.exec(queryString);

    if (!match) return [];
    const [, , trigger, inputText] = match;
    return mentions
      .filter(mention => {
        let text = '';
        if (typeGuards.isObject(mention)) {
          text = mention.text;
        } else {
          text = mention;
        }
        return String(text).toLowerCase().includes(inputText.toLowerCase());
      })
      .map(mention => new MentionOption(mention, trigger))
      .slice(0, suggestionListLength);
  }, [mentions, queryString, AtMentionsRegex, suggestionListLength]);

  const onSelectOption = useCallback(
    (selectedOption: MentionOption, nodeToReplace: TextNode | null, closeMenu: () => void) => {
      editor.update(() => {
        const mentionNode = $createMentionNode({
          trigger: selectedOption.trigger,
          text: `${selectedOption.trigger}${selectedOption.name}`,
          value: selectedOption.value ?? selectedOption.name
        });
        if (nodeToReplace) {
          nodeToReplace.replace(mentionNode);
        }
        closeMenu();
      });
    },
    [editor]
  );

  const checkForMentionMatch = useCallback(
    (text: string) => {
      if (!mentions.length) return null;
      const match = AtMentionsRegex.exec(text);

      if (match !== null) {
        const matchingString = match[2] + match[3];
        return {
          leadOffset: match.index + match[1].length,
          matchingString,
          replaceableString: matchingString
        };
      }
      return null;
    },
    [mentions, AtMentionsRegex]
  );

  return (
    <LexicalTypeaheadMenuPlugin<MentionOption>
      anchorClassName={EDITOR_CLASSNAME_NAMESPACE}
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForMentionMatch}
      options={options}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
      ) => {
        return anchorElementRef && options.length
          ? ReactDOM.createPortal(
              <List>
                {options.map((option, i: number) => (
                  <ListItem
                    isSelected={selectedIndex === i}
                    onClick={() => {
                      setHighlightedIndex(i);
                      selectOptionAndCleanUp(option);
                    }}
                    onMouseEnter={() => {
                      setHighlightedIndex(i);
                    }}
                    key={option.key}
                  >
                    {option.name}
                  </ListItem>
                ))}
              </List>,
              anchorElementRef.current!
            )
          : null;
      }}
    />
  );
};
