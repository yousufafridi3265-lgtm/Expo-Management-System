# `MessagesPage`

Source: [`MessagesPage.jsx`](../../src/components/messages/MessagesPage.jsx)

Complete signed-in messages and feedback page. It loads the current user's
messages, displays replies and event context, and opens separate dialogs for
new messages and feedback.

This component takes no props. It uses `PublicLayout`, `MessageForm`,
`FeedbackForm`, message and feedback APIs, and common loading, error, empty,
and dialog components. Successful message submission refreshes the list;
successful feedback submission shows confirmation and closes its dialog.
