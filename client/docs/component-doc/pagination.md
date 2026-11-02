# `Pagination`

Source: [`Pagination.jsx`](../../src/components/common/Pagination.jsx)

Renders page navigation with previous/next controls and a compact set of page
numbers. A page-size selector is optional.

## Props

- `page`: current one-based page number.
- `pageCount`: total number of pages.
- `onChange(page)`: called with the selected page number.
- `pageSize`: currently selected page size, used with the selector.
- `onPageSizeChange(size)`: optional callback; when supplied and `totalItems`
  exceeds 5, displays choices 5, 10, 15, and 20.
- `totalItems`: total record count; defaults to `0`.

The component renders nothing when there is neither multiple pages nor a
visible page-size selector. The parent owns pagination state and data slicing.
