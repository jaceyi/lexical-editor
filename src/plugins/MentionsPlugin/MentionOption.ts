import { MenuOption } from '@lexical/react/LexicalTypeaheadMenuPlugin';
import * as typeGuards from '../../utils/typeGuards';

export type MentionItem = { text: string; value: string | number } | string;

export class MentionOption extends MenuOption {
  name: string;
  trigger: string;
  value?: string | number;

  constructor(item: MentionItem, trigger: string) {
    if (typeGuards.isObject(item)) {
      super(item.text);
      this.name = item.text;
      this.value = item.value;
    } else {
      super(item);
      this.name = item;
    }
    this.trigger = trigger;
  }
}
