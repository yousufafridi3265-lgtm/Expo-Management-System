# `Navbar`

Source: [`Navbar.jsx`](../../src/components/layout/Navbar.jsx)

Renders the responsive site header, role-aware navigation, authentication
actions, theme toggles, and a mobile menu.

This component takes no props. It reads the user, authentication loading
state, and logout action from `AuthContext`; route destinations come from
`ROUTES`. Admins see management links, while attendees and exhibitors see
public links and role-specific pages. The mobile menu closes when a link or
logout action is selected.
