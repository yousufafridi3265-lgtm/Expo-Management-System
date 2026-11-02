# `NavItem`

Source: [`NavItem.jsx`](../../src/components/layout/NavItem.jsx)

Wraps React Router's `NavLink` with the shared navigation classes and an
active class when its route matches the current location.

## Props

- `to`: destination route.
- `children`: link content.
- `onClick`: optional click callback.
- `end`: exact route matching; defaults to `false`. When false, nested routes
  also match the link.
