# `AuthLayout`

Source: [`AuthLayout.jsx`](../../src/components/layout/AuthLayout.jsx)

Provides the shared sign-in/sign-up page structure: theme toggle, home-linked
brand, title, optional subtitle, content card, and optional footer text.

## Props

- `title`: page heading.
- `subtitle`: optional supporting text.
- `footer`: optional footer content shown inside the card.
- `wide`: enables the wider card style; defaults to `false`.
- `children`: form or other page content.

Requires the application's React Router context for the home link and a theme
provider for `ThemeToggle`.
