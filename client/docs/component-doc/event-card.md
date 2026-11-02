# `EventCard`

Source: [`EventCard.jsx`](../../src/components/common/EventCard.jsx)

Renders a linked event summary with its name, status, date range, location,
and optional description.

## Props

- `event`: event record with `_id`, `name`, `status`, `startDate`, `endDate`,
  `location`, and optional `description`.

The card links to the event detail route and uses shared date formatting and
status presentation.
