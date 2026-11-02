# `StatCard`

Source: [`StatCard.jsx`](../../src/components/Admin/StatCard.jsx)

Displays a dashboard statistic with an optional icon and detail line. It
renders as a React Router link when a destination is supplied, otherwise as
a non-interactive `div`.

## Props

- `icon`: optional icon component.
- `label`, `value`: statistic label and value.
- `detail`: optional supporting text.
- `to`: optional route destination; makes the whole card a link.
- `highlight`: optional emphasis, defaults to `false`.
