import { $applyNodeReplacement, DecoratorNode } from 'lexical';
import { FileComponent } from './FileComponent';

export class FileNode extends DecoratorNode {
  static getType() {
    return 'file';
  }

  static clone(node) {
    return new FileNode({
      key: node.__key,
      url: node.__url,
      name: node.__name
    });
  }

  static importJSON(serializedNode) {
    const { url, name } = serializedNode;
    return $createFileNode({
      url,
      name
    });
  }

  static importDOM() {
    return {
      a: () => ({
        conversion: a => {
          return {
            node: $createFileNode({
              url: a.href,
              name: a.innerText
            })
          };
        },
        priority: 1
      })
    };
  }

  constructor({ key, url, name }) {
    super(key);
    this.__url = url;
    this.__name = name;
  }

  exportJSON() {
    return {
      key: this.getKey(),
      type: this.getType(),
      url: this.__url,
      name: this.__name
    };
  }

  createDOM(config) {
    const dom = document.createElement('span');
    const className = config.theme.file;
    if (className) {
      dom.className = className;
    }
    return dom;
  }

  exportDOM() {
    const element = document.createElement('a');
    element.href = this.__url;
    element.innerText = this.__name;
    if (!element) return;
    return {
      element
    };
  }

  updateDOM() {
    return false;
  }

  decorate() {
    return (
      <FileComponent
        url={this.__url}
        name={this.__name}
        nodeKey={this.getKey()}
      />
    );
  }
}

export const $isFileNode = node => node instanceof FileNode;
export const $createFileNode = payload => {
  return $applyNodeReplacement(new FileNode(payload));
};
