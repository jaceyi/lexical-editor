import { useState } from 'react';
import Editor from './components/Editor';

const App = () => {
  const [editor, setEditor] = useState(null);
  const [readValue, setReadValue] = useState('');

  return (
    <Editor namespace="ReasonEditor" value={readValue} onChange={setEditor} />
  );
};

export default App;
