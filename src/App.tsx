import { useState, useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { registerLuceneLanguage, type FieldSchema } from './lucene-monarch'
import FieldSchemaEditor from './FieldSchemaEditor'
import './App.css'

function App() {
  // Define custom field schema for completion with state management
  const [fieldSchema, setFieldSchema] = useState<FieldSchema[]>([
    { key: 'level', values: ['warning', 'info', 'error'] },
    { key: 'location', values: ['123.123.123', '3333.444'] }
  ]);

  const editorRef = useRef<unknown>(null);
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null);

  // Re-register language when field schema changes
  useEffect(() => {
    if (monacoRef.current) {
      registerLuceneLanguage(monacoRef.current, fieldSchema);
    }
  }, [fieldSchema]);

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
!urgent || priority:high
level:warning
location:123.123.123`)


  return (
    <>
      <h1>Lucene Monaco Editor</h1>
      
      <FieldSchemaEditor 
        fieldSchema={fieldSchema} 
        onChange={setFieldSchema} 
      />
      
      <div style={{ marginBottom: '10px', padding: '8px', backgroundColor: '#f0f8ff', border: '1px solid #007acc', borderRadius: '4px', fontSize: '14px' }}>
        💡 <strong>Completion Tips:</strong> Press <kbd>Ctrl+Space</kbd> for suggestions, or type field names and press <kbd>:</kbd> for field-specific values
      </div>
      
      <div style={{ height: '400px', border: '1px solid #ccc' }}>
        <Editor
          height="100%"
          defaultLanguage="lucene"
          value={value}
          onChange={(value) => setValue(value || '')}
          theme="lucene-theme"
          loading={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>Loading Monaco Editor...</div>}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            automaticLayout: true,
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            suggestSelection: 'first',
            acceptSuggestionOnEnter: 'on',
          }}
          onMount={(editor, monaco) => {
            try {
              editorRef.current = editor;
              monacoRef.current = monaco;
              registerLuceneLanguage(monaco, fieldSchema);
              console.log('Monaco Editor loaded successfully');
            } catch (error) {
              console.error('Monaco initialization error:', error);
            }
          }}
          onValidate={(markers) => {
            if (markers.length > 0) {
              console.log('Monaco validation markers:', markers);
            }
          }}
        />
      </div>
    </>
  )
}

export default App
