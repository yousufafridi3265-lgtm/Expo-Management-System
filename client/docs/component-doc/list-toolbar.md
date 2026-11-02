# `ListToolbar`

Source: [`ListToolbar.jsx`](../../src/components/lists/ListToolbar.jsx)

Combines a search input with a status dropdown. It is controlled by its
parent, so filtering behavior and list state remain outside the component.

## Props

- `search`: current search value.
- `onSearchChange(value)`: called with the input text.
- `searchPlaceholder`: optional search hint.
- `status`: current status value.
- `onStatusChange(value)`: called with the selected status value.
- `statusOptions`: select choices in `{ value, label }` form.

The status dropdown includes an "All statuses" placeholder.
