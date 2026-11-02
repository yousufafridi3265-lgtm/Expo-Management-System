# `EventBooths`

Source: [`EventBooths.jsx`](../../src/components/common/EventBooths.jsx)

Loads and displays booths for an event. Exhibitors can request an available
booth for an upcoming event and must confirm the booking first.

## Props

- `event`: event record; uses `_id` and `status` to load and determine booking
  availability.

The list displays booth number, status, size, price, and optional location.
Loading and retryable error states are provided. Successful or failed booking
requests notify the user and refresh the booth list.
