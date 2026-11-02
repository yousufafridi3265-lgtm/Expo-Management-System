# `AdminStats`

Source: [`AdminStats.jsx`](../../src/components/Admin/AdminStats.jsx)

Fetches and displays administrator dashboard totals for users, events,
exhibitors, booths, bookings, event registrations, sessions, session
registrations, messages, and feedback.

## Props

This component takes no props. It calls `getAdminStats` through `useFetch`.

## States and behavior

Displays a page loader while the request is pending and an error with a retry
action on failure. Pending exhibitors, open messages, and new feedback
highlight their respective cards. Selected cards link to related admin
management routes.
