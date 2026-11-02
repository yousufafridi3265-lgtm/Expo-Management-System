# Admin `AdminExhibitorCard`

Source: [`AdminExhibitorCard.jsx`](../../src/components/Admin/AdminExhibitorCard.jsx)

Renders an exhibitor row in the admin management list, showing its logo,
company, category, phone, owner, and approval status.

## Props

- `exhibitor`: exhibitor record; reads `_id`, `logo`, `companyName`, `category`,
  `phone`, `userId`, and `approvalStatus`.
- `busy`: passed to available action buttons as their loading state.
- `onChangeStatus(exhibitor, status)`: called with `"approved"` or `"rejected"`.

The public-page link is shown only when approved. The current approval action
is omitted, so an already-approved exhibitor cannot be approved again in this
row, for example.

## Related components

Uses `ExhibitorLogo`, `StatusBadge`, `Button`, and the `exhibitorPath` route
helper.
