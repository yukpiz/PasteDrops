# PasteDrops 💧

Paste JSON from clipboard to auto-fill form fields using CSS selectors.

## Install

1. Clone this repository
2. Open `chrome://extensions/` in Chrome
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `PasteDrops` directory

## Usage

1. Copy a JSON string to your clipboard:

```json
{
  "fields": [
    { "target": "#username", "value": "yukpiz" },
    { "target": "[name='email']", "value": "test@example.com" },
    { "target": ".form-group > input", "value": "hello" },
    { "target": "#notify-email", "checked": true }
  ]
}
```

2. Trigger PasteDrops:
   - **Shortcut**: `Ctrl+Shift+V` (Mac: `Cmd+Shift+V`)
   - **Toolbar**: Click the PasteDrops icon in Chrome toolbar

3. Form fields matching the CSS selectors will be filled automatically.

## JSON Format

| Key | Description |
|---|---|
| `fields` | Array of field definitions |
| `fields[].target` | CSS selector to find the input element |
| `fields[].value` | Value to set (for text inputs, textareas, selects) |
| `fields[].checked` | Set to `true` to check radio buttons or checkboxes |

### Selector Examples

| Selector | Matches |
|---|---|
| `#username` | `<input id="username">` |
| `[name='email']` | `<input name="email">` |
| `.my-class input` | `<input>` inside `.my-class` |
| `form > input:nth-child(2)` | 2nd direct child input of a form |

## License

MIT
