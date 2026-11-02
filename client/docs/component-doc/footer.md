# `Footer`

Source: [`Footer.jsx`](../../src/components/layout/Footer.jsx)

Renders the site footer with the current year and navigation links. Events
are always linked. Login, signup, and exhibitor links are shown only when no
user is authenticated.

This component takes no props and reads the signed-in user from `AuthContext`.
