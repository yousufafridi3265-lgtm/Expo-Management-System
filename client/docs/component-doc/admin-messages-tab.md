# `AdminMessagesTab`

Source: [`AdminMessagesTab.jsx`](../../src/components/Admin/AdminMessagesTab.jsx)

Displays organizer inbox messages, with Open, Replied, and All filters.
Open messages can be answered in a modal.

## Props

This component takes no props. It loads its data from the message API.

## States and behavior

Provides loading, retryable error, and empty states. Each item shows sender
details, optional event context, message text, and any reply with its timestamp.
The reply form and list refresh after a successful response. If another admin
has already replied (HTTP 409), it reports the error, closes the modal, and
reloads the inbox.
