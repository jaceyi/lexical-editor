import React from 'react';
import ReactDOM from 'react-dom';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalTypeaheadMenuPlugin } from '@lexical/react/LexicalTypeaheadMenuPlugin';
import { TextNode } from 'lexical';
import { useCallback, useMemo, useState } from 'react';
import { $createMentionNode } from '../../nodes/MentionNode';
import {
  MentionsMenuItem,
  MentionOption,
  MentionsItem
} from './MentionsMenuItem';
import { EDITOR_CLASSNAME_NAMESPACE } from '../../utils/consts';

export interface MentionsThemeClasses {
  container?: string;
  menu?: string;
  menuItem?: string;
  menuItemSelected?: string;
}

export interface MentionsPluginProps {
  mentions?: MentionsItem[];
  trigger?: string | string[];
  validCharsLength?: number;
  suggestionListLength?: number;
}

export const MentionsPlugin: React.FC<MentionsPluginProps> = ({
  mentions = [],
  trigger = '@',
  validCharsLength = 50,
  suggestionListLength = 5
}) => {
  const _trigger = Array.isArray(trigger) ? trigger.join('|') : trigger;
  const AtMentionsRegex = useMemo(
    () =>
      new RegExp(
        `(^|\\s)(${_trigger})((?:[^ ${_trigger}\\s]){0,${validCharsLength}})$`
      ),
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
        if (typeof mention === 'object') {
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
    (
      selectedOption: MentionOption,
      nodeToReplace: TextNode | null,
      closeMenu: () => void
    ) => {
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

  const menuClassName = editor._config.theme.mentions?.menu;

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
              <ul className={menuClassName}>
                {options.map((option, i: number) => (
                  <MentionsMenuItem
                    isSelected={selectedIndex === i}
                    onClick={() => {
                      setHighlightedIndex(i);
                      selectOptionAndCleanUp(option);
                    }}
                    onMouseEnter={() => {
                      setHighlightedIndex(i);
                    }}
                    key={option.key}
                    option={option}
                  />
                ))}
              </ul>,
              anchorElementRef.current!
            )
          : null;
      }}
    />
  );
};
