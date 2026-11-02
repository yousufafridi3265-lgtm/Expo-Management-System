# `CancelBookingButton`

Source: [`CancelBookingButton.jsx`](../../src/components/common/CancelBookingButton.jsx)

Provides a cancel-booking button and confirmation dialog, then calls the
booking cancellation API.

## Props

- `bookingId`: booking identifier sent to the API.
- `boothNumber`: included in the confirmation message.
- `onCancelled()`: called after both success and failure so the parent can
  refresh booking state.

Success and failure are notified. On failure it also closes the dialog and
asks the parent to reload.
