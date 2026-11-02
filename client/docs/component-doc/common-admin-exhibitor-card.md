# Common `AdminExhibitorCard`

Source: [`AdminExhibitorCard.jsx`](../../src/components/common/AdminExhibitorCard.jsx)

This common-folder version renders an exhibitor row for admin review. It shows
the company's logo and contact details, owner information when available, and
approval status.

## Props

- `exhibitor`: record with company details, `_id`, owner in `userId`, and
  `approvalStatus`.
- `busy`: loading state for approval actions.
- `onChangeStatus(exhibitor, status)`: callback for `"approved"` or
  `"rejected"`.

The public-page link appears only for approved exhibitors. The action matching
the current status is hidden. This is a separate source file from
[`Admin/AdminExhibitorCard.jsx`](../../src/components/Admin/AdminExhibitorCard.jsx).
