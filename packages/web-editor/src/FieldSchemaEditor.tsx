import { useState } from 'react'
import type { FieldSchema } from '@lucene-tools/core'

interface FieldSchemaEditorProps {
  fieldSchema: FieldSchema[]
  onChange: (schema: FieldSchema[]) => void
}

export default function FieldSchemaEditor({ fieldSchema, onChange }: FieldSchemaEditorProps) {
  const [newFieldKey, setNewFieldKey] = useState('')
  const [newFieldValue, setNewFieldValue] = useState('')

  const addField = () => {
    const trimmedKey = newFieldKey.trim()
    const trimmedValue = newFieldValue.trim()
    
    // Validation
    if (!trimmedKey) return
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmedKey)) {
      alert('Field name must start with a letter or underscore and contain only letters, numbers, and underscores')
      return
    }
    
    const existingField = fieldSchema.find(f => f.key === trimmedKey)
    if (existingField) {
      // Add value to existing field (check for duplicates)
      if (trimmedValue && !existingField.values.includes(trimmedValue)) {
        const updatedSchema = fieldSchema.map(f => 
          f.key === trimmedKey 
            ? { ...f, values: [...f.values, trimmedValue] }
            : f
        )
        onChange(updatedSchema)
      }
    } else {
      // Create new field
      const newField: FieldSchema = {
        key: trimmedKey,
        values: trimmedValue ? [trimmedValue] : []
      }
      onChange([...fieldSchema, newField])
    }
    
    setNewFieldKey('')
    setNewFieldValue('')
  }

  const removeField = (fieldKey: string) => {
    onChange(fieldSchema.filter(f => f.key !== fieldKey))
  }

  const removeValue = (fieldKey: string, valueToRemove: string) => {
    onChange(fieldSchema.map(f => 
      f.key === fieldKey 
        ? { ...f, values: f.values.filter(v => v !== valueToRemove) }
        : f
    ).filter(f => f.values.length > 0)) // Remove fields with no values
  }

  const addValueToField = (fieldKey: string, newValue: string) => {
    const trimmedValue = newValue.trim()
    if (!trimmedValue) return
    
    // Check for duplicate values
    const field = fieldSchema.find(f => f.key === fieldKey)
    if (field && field.values.includes(trimmedValue)) {
      return // Don't add duplicate values
    }
    
    onChange(fieldSchema.map(f => 
      f.key === fieldKey 
        ? { ...f, values: [...f.values, trimmedValue] }
        : f
    ))
  }

  return (
    <div className="space-y-4">
      {/* Add new field form */}
      <div className="bg-gray-100 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-gray-300 dark:bg-gray-700/50 dark:border-gray-600">
        <div className="flex flex-col space-y-3 sm:flex-row sm:flex-wrap sm:gap-3 sm:items-center sm:space-y-0">
          <input
            type="text"
            placeholder="Field name (e.g., level)"
            value={newFieldKey}
            onChange={(e) => setNewFieldKey(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:min-w-32 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          />
          <input
            type="text"
            placeholder="Value (e.g., warning)"
            value={newFieldValue}
            onChange={(e) => setNewFieldValue(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:min-w-32 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          />
          <button
            onClick={addField}
            disabled={!newFieldKey.trim()}
            className={`w-full sm:w-auto px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              newFieldKey.trim()
                ? 'bg-blue-600 hover:bg-blue-700 text-white lucene-button'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
            }`}
          >
            Add Field/Value
          </button>
        </div>
      </div>

      {/* Existing fields */}
      <div className="space-y-3">
        {fieldSchema.map((field) => (
          <div key={field.key} className="bg-gray-50 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-gray-200 dark:bg-gray-700/30 dark:border-gray-600">
            <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mb-3">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                <span className="bg-purple-600 w-6 h-6 rounded flex items-center justify-center text-xs mr-2">
                  🏷️
                </span>
                {field.key}:
              </h4>
              <button
                onClick={() => removeField(field.key)}
                className="w-full sm:w-auto px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-md transition-colors lucene-button"
              >
                Remove Field
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {field.values.map((value, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 border border-blue-300 rounded-full text-blue-700 text-xs dark:bg-blue-600/20 dark:border-blue-500/30 dark:text-blue-300"
                >
                  {value}
                  <button
                    onClick={() => removeValue(field.key, value)}
                    className="ml-1 text-red-600 hover:text-red-500 transition-colors dark:text-red-400 dark:hover:text-red-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <AddValueForm fieldKey={field.key} onAddValue={addValueToField} />
          </div>
        ))}
      </div>

      {fieldSchema.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-2xl">📋</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 italic">
            No custom fields defined. Add a field above to get started.
          </p>
        </div>
      )}
    </div>
  )
}

// Helper component for adding values to existing fields
function AddValueForm({ fieldKey, onAddValue }: { fieldKey: string; onAddValue: (fieldKey: string, value: string) => void }) {
  const [newValue, setNewValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newValue.trim()) {
      onAddValue(fieldKey, newValue.trim())
      setNewValue('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <input
        type="text"
        placeholder="Add new value..."
        value={newValue}
        onChange={(e) => setNewValue(e.target.value)}
        className="flex-1 px-2 py-1 bg-white border border-gray-300 rounded text-gray-900 placeholder-gray-500 text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent min-w-24 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
      />
      <button
        type="submit"
        disabled={!newValue.trim()}
        className={`px-2 py-1 text-xs rounded transition-colors ${
          newValue.trim()
            ? 'bg-green-600 hover:bg-green-700 text-white lucene-button'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
        }`}
      >
        +
      </button>
    </form>
  )
}