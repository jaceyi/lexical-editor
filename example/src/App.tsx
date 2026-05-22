import React from 'react';
import Editor, { useHTMLHandle } from '../../src/index';
import type { UploadFile } from '../../src/types';

const onUploadFile: UploadFile = file => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ url: reader.result as string, name: file.name });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const App = () => {
  const [{ value: htmlOutput }, htmlEditorProps] = useHTMLHandle({
    initialValue:
      '<h2><span>Example</span></h2><p><span>Welcome </span><span data-lexical-mention="true" data-lexical-mention-trigger="@" data-lexical-mention-value="Jace">@Jace</span></p><ul class="theme__ul" __lexicallisttype="check"><li role="checkbox" tabindex="-1" aria-checked="true" value="1" class="theme__listItem theme__listItemChecked"><span>JavaScript</span></li><li role="checkbox" tabindex="-1" aria-checked="false" value="2" class="theme__listItem theme__listItemUnchecked"><span class="theme__textKeyword" data-lexical-keyword="true">React</span></li></ul>'
  });
  console.log(htmlOutput);

  return (
    <div className="container">
      <h2>Dev Example</h2>
      <Editor
        {...htmlEditorProps}
        namespace="dev-editor"
        placeholder="开始输入..."
        config={{
          onUploadFile,
          keywords: ['javascript', 'react'],
          mentions: ['Jace', 'Liliana', 'Chandra', 'Gideon', 'Nissa', 'Ajani']
        }}
      />
    </div>
  );
};

export default App;
