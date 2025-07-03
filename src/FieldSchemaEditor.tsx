import { useState } from 'react'
import type { FieldSchema } from './lucene-monarch'

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
    <div style={{ marginBottom: '20px', padding: '16px', border: '1px solid #ddd', borderRadius: '4px' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold' }}>Field Schema Editor</h3>
      
      {/* Add new field form */}
      <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Field name (e.g., level)"
            value={newFieldKey}
            onChange={(e) => setNewFieldKey(e.target.value)}
            style={{ padding: '4px 8px', border: '1px solid #ccc', borderRadius: '4px', minWidth: '120px' }}
          />
          <input
            type="text"
            placeholder="Value (e.g., warning)"
            value={newFieldValue}
            onChange={(e) => setNewFieldValue(e.target.value)}
            style={{ padding: '4px 8px', border: '1px solid #ccc', borderRadius: '4px', minWidth: '120px' }}
          />
          <button
            onClick={addField}
            disabled={!newFieldKey.trim()}
            style={{
              padding: '4px 12px',
              backgroundColor: newFieldKey.trim() ? '#007acc' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: newFieldKey.trim() ? 'pointer' : 'not-allowed'
            }}
          >
            Add Field/Value
          </button>
        </div>
      </div>

      {/* Existing fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {fieldSchema.map((field) => (
          <div key={field.key} style={{ padding: '12px', border: '1px solid #e0e0e0', borderRadius: '4px', backgroundColor: '#fafafa' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                {field.key}:
              </h4>
              <button
                onClick={() => removeField(field.key)}
                style={{
                  padding: '2px 8px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Remove Field
              </button>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              {field.values.map((value, index) => (
                <span
                  key={index}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    backgroundColor: '#e3f2fd',
                    border: '1px solid #bbdefb',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#1976d2'
                  }}
                >
                  {value}
                  <button
                    onClick={() => removeValue(field.key, value)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#d32f2f',
                      cursor: 'pointer',
                      fontSize: '10px',
                      padding: '0',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
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
        <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center' }}>
          No custom fields defined. Add a field above to get started.
        </p>
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
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
      <input
        type="text"
        placeholder="Add new value..."
        value={newValue}
        onChange={(e) => setNewValue(e.target.value)}
        style={{ 
          padding: '3px 6px', 
          border: '1px solid #ccc', 
          borderRadius: '3px', 
          fontSize: '12px',
          flex: 1,
          minWidth: '100px'
        }}
      />
      <button
        type="submit"
        disabled={!newValue.trim()}
        style={{
          padding: '3px 8px',
          backgroundColor: newValue.trim() ? '#28a745' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '3px',
          cursor: newValue.trim() ? 'pointer' : 'not-allowed',
          fontSize: '12px'
        }}
      >
        +
      </button>
    </form>
  )
}