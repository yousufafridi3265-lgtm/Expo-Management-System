# `AdminFeedbackTab`

Source: [`AdminFeedbackTab.jsx`](../../src/components/Admin/AdminFeedbackTab.jsx)

Loads and displays admin feedback with filters for new, reviewed, or all
entries. New items can be marked reviewed; the list is reloaded after the
request completes.

## Props

This component takes no props. It obtains feedback through `useFetch` and the
feedback API.

## States and behavior

Shows loading, retryable error, and empty states. Feedback entries include
subject, sender details when available, timestamp, description, and status.
Success and request errors are reported through notifications.
