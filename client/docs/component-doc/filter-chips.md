# `FilterChips`

Source: [`FilterChips.jsx`](../../src/components/common/FilterChips.jsx)

Renders a set of pressed-state filter buttons in an accessible group.

## Props

- `options`: array of `{ value, label }` choices.
- `value`: currently selected option value.
- `onChange(value)`: called when an option is selected.
- `label`: accessible name for the button group.

The selected option receives the active class and `aria-pressed="true"`.
