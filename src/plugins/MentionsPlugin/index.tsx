import React from 'react';
import ReactDOM from 'react-dom';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalTypeaheadMenuPlugin } from '@lexical/react/LexicalTypeaheadMenuPlugin';
import { $createTextNode, TextNode } from 'lexical';
import { useCallback, useMemo, useState } from 'react';
import { $createMentionNode } from '../../nodes/MentionNode';
import { EDITOR_CLASSNAME_NAMESPACE } from '../../utils/consts';
import * as typeGuards from '../../utils/typeGuards';
import { List, ListItem } from '../../ui/List';
import { MentionOption, MentionItem } from './MentionOption';
import { createMentionTriggerRegex, getMentionTriggerMatch } from './mentionTrigger';

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
 * 提及（Mentions）插件：输入触发字符后展示候选列表，选中后插入 MentionNode。
 */
export const MentionsPlugin: React.FC<MentionsPluginProps> = ({
  mentions = [],
  trigger = '@',
  validCharsLength = 50,
  suggestionListLength = 5
}) => {
  const mentionRegex = useMemo(
    () => createMentionTriggerRegex(trigger, validCharsLength),
    [trigger, validCharsLength]
  );

  const [editor] = useLexicalComposerContext();

  const [queryString, setQueryString] = useState<string | null>(null);

  const options = useMemo(() => {
    if (!mentions.length || !queryString) return [];
    const match = getMentionTriggerMatch(mentionRegex, queryString);

    if (!match) return [];
    const { trigger, query } = match;
    return mentions
      .filter(mention => {
        let text = '';
        if (typeGuards.isObject(mention)) {
          text = mention.text;
        } else {
          text = mention;
        }
        return String(text).toLowerCase().includes(query.toLowerCase());
      })
      .map(mention => new MentionOption(mention, trigger))
      .slice(0, suggestionListLength);
  }, [mentions, queryString, mentionRegex, suggestionListLength]);

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
          // 空文本节点会被归一化移除，但能让光标落在提及之后（否则光标会回到段首）
          const trailingTextNode = $createTextNode('');
          mentionNode.insertAfter(trailingTextNode);
          trailingTextNode.select(0, 0);
        }
        closeMenu();
      });
    },
    [editor]
  );

  const checkForMentionMatch = useCallback(
    (text: string) => {
      if (!mentions.length) return null;
      const match = getMentionTriggerMatch(mentionRegex, text);

      if (match) {
        return {
          leadOffset: match.leadOffset,
          matchingString: match.matchingString,
          replaceableString: match.matchingString
        };
      }
      return null;
    },
    [mentions.length, mentionRegex]
  );

  return (
    <LexicalTypeaheadMenuPlugin<MentionOption>
      anchorClassName={EDITOR_CLASSNAME_NAMESPACE}
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForMentionMatch}
      options={options}
      // 提及是文本实体，Lexical 默认会忽略实体边界处的触发（如已插入的提及后紧跟 @），这里放开限制
      ignoreEntityBoundary
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
