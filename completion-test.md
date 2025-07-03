# Completion Testing Guide

## How to Test Completions

1. **Start the development server**:
   ```bash
   pnpm dev
   ```

2. **Open http://localhost:5174** in your browser

3. **Test Field Name Completions**:
   - Clear the editor content
   - Press `Ctrl+Space` (or `Cmd+Space` on Mac)
   - You should see field suggestions including `level`, `location`, `title`, `author`, etc.
   - **OR** start typing a field name (e.g., type "lev") and you should see filtered suggestions
   - Custom fields are prioritized and show their available values in the documentation

4. **Test Field-Specific Value Completions**:
   - Type `level:` and wait a moment or press `Ctrl+Space`
   - You should see: `warning`, `info`, `error`
   - Continue typing after the colon (e.g., `level:w`) and you should see filtered suggestions (`warning`)
   - Type `location:` and wait a moment or press `Ctrl+Space`  
   - You should see: `123.123.123`, `3333.444`
   - Continue typing after the colon (e.g., `location:123`) and you should see filtered suggestions

5. **Test Custom Field Addition**:
   - In the Field Schema Editor above the editor, add a new field:
     - Field name: `priority`
     - Value: `high`
   - Click "Add Field/Value"
   - Now type `priority:` in the editor
   - You should see `high` as a completion option

6. **Test General Completions**:
   - Type anywhere in the editor and press `Ctrl+Space`
   - You should see operators like `AND`, `OR`, `NOT`
   - You should see pattern completions like "fuzzy search", "range inclusive"

## Troubleshooting

If completions don't show:
- Make sure you're pressing `Ctrl+Space` (or `Cmd+Space` on Mac)
- Try typing a field name followed by `:` (colon)
- Check the browser console for any errors
- Make sure the Monaco editor has focus (click inside it)

## Expected Behavior

✅ Field names appear when pressing `Ctrl+Space` at the start of a line
✅ Custom fields show "Custom field: fieldname" in documentation
✅ After typing `field:`, only that field's values appear
✅ Operators and patterns appear in appropriate contexts
✅ Completions update immediately when you modify the field schema