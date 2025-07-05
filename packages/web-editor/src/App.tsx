import { useState, useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { registerLuceneLanguage, type FieldSchema } from '@lucene-tools/monaco-language'
import FieldSchemaEditor from './FieldSchemaEditor'
import { useTheme } from './ThemeContext'
import './App.css'

function App() {
  const { theme, toggleTheme } = useTheme();
  
  // Define custom field schema for completion with state management
  const [fieldSchema, setFieldSchema] = useState<FieldSchema[]>([
    { key: 'level', values: ['warning', 'info', 'error'] },
    { key: 'location', values: ['123.123.123', '3333.444'] },
    { key: 'price', values: ['100', '200', '500'] },
    { key: 'rating', values: ['1', '2', '3', '4', '5'] }
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
price>=100 AND price<=500
rating>3.5 AND reviews>=10
timestamp:[2023-01-01 TO *]
views:[* TO 1000]
!urgent || priority:high
level:warning
location:123.123.123`)


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 dark:text-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 dark:bg-gray-800/50 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            {/* Main title and description */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Lucene Monaco Editor
              </h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                Intelligent Lucene query editor with syntax highlighting and smart completion
              </p>
            </div>
            
            {/* Controls section */}
            <div className="flex items-center justify-between sm:justify-end">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
              
              {/* Version badges */}
              <div className="flex items-center space-x-2 ml-3 sm:ml-4">
                <div className="px-2 sm:px-3 py-1 bg-blue-100 border border-blue-300 rounded-full text-blue-700 text-xs sm:text-sm dark:bg-blue-600/20 dark:border-blue-500/30 dark:text-blue-300">
                  <span className="hidden xs:inline">v4.0 </span>Beta
                </div>
                <div className="hidden sm:flex px-3 py-1 bg-green-100 border border-green-300 rounded-full text-green-700 text-sm dark:bg-green-600/20 dark:border-green-500/30 dark:text-green-300">
                  Tailwind CSS 4
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Field Schema Section */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4 sm:p-6 dark:bg-gray-800/50 dark:border-gray-700">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center">
              <span className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold mr-3">
                ⚙️
              </span>
              Field Schema Configuration
            </h2>
            <FieldSchemaEditor 
              fieldSchema={fieldSchema} 
              onChange={setFieldSchema} 
            />
          </div>
        </div>

        {/* Tips Section */}
        <div className="mb-4 sm:mb-6">
          <div className="bg-gradient-to-r from-blue-100/50 to-purple-100/50 backdrop-blur-sm rounded-xl border border-blue-300/50 p-3 sm:p-4 dark:from-blue-900/50 dark:to-purple-900/50 dark:border-blue-500/30">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  💡
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-700 mb-1 text-sm sm:text-base dark:text-blue-300">Completion Tips</h3>
                <p className="text-gray-700 text-xs sm:text-sm dark:text-gray-300 leading-relaxed">
                  Press <kbd className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-200 rounded text-xs font-mono dark:bg-gray-700">Ctrl+Space</kbd> for suggestions, 
                  or type field names and press <kbd className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-200 rounded text-xs font-mono dark:bg-gray-700">:</kbd> for field-specific values
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Editor Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 overflow-hidden dark:bg-gray-800/50 dark:border-gray-700">
          <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:bg-gray-900/50 dark:border-gray-700">
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <h2 className="text-base sm:text-lg font-semibold flex items-center">
                <span className="bg-purple-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold mr-3">
                  🔍
                </span>
                Lucene Query Editor
              </h2>
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Connected</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">Auto-completion enabled</span>
              </div>
            </div>
          </div>
          
          <div className="h-80 sm:h-96 bg-white dark:bg-gray-900">
            <Editor
              height="100%"
              defaultLanguage="lucene"
              value={value}
              onChange={(value) => setValue(value || '')}
              theme={theme === 'dark' ? 'lucene-dark-theme' : 'lucene-light-theme'}
              loading={
                <div className="flex items-center justify-center h-full bg-white dark:bg-gray-900">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="text-gray-600 dark:text-gray-400">Loading Monaco Editor...</span>
                  </div>
                </div>
              }
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                automaticLayout: true,
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                suggestSelection: 'first',
                acceptSuggestionOnEnter: 'on',
                scrollBeyondLastLine: false,
                renderLineHighlight: 'gutter',
                selectionHighlight: false,
                scrollbar: {
                  vertical: 'auto',
                  horizontal: 'auto',
                  verticalScrollbarSize: 12,
                  horizontalScrollbarSize: 12,
                },
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
        </div>

        {/* Footer Info */}
        <div className="mt-6 sm:mt-8 text-center text-gray-600 text-xs sm:text-sm dark:text-gray-500 px-4">
          <p className="flex flex-col sm:flex-row sm:items-center sm:justify-center">
            <span>Built with React, Monaco Editor, and Tailwind CSS 4</span>
            <span className="hidden sm:inline mx-2">•</span>
            <a href="https://github.com/wen-templari/lucene-monaco-editor" className="text-blue-600 hover:text-blue-500 mt-1 sm:mt-0 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
              View on GitHub
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}

export default App
