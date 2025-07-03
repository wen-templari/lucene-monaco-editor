import { useState } from 'react'
import Editor from '@monaco-editor/react'
import { registerLuceneLanguage } from './lucene-monarch'
import './App.css'

function App() {
  const [value, setValue] = useState(`title:"The Right Way" AND text:go
author:john~2
(jakarta OR apache) AND website
price:[100 TO 200]
boost:title^2.5
field:value*
"hello world"~10
NOT category:electronics
+required -prohibited
date:[2023-01-01 TO 2023-12-31]
created:{2023-01-01T00:00:00Z TO 2023-12-31T23:59:59Z}
content:/[Jj]ava.*/
score:>5 && status:active
!urgent || priority:high`)


  return (
    <>
      <h1>Lucene Monaco Editor</h1>
      <div style={{ height: '400px', border: '1px solid #ccc' }}>
        <Editor
          height="100%"
          defaultLanguage="lucene"
          value={value}
          onChange={(value) => setValue(value || '')}
          theme="lucene-theme"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            automaticLayout: true,
          }}
          onMount={(_, monaco) => {
            registerLuceneLanguage(monaco);
          }}
        />
      </div>
    </>
  )
}

export default App
