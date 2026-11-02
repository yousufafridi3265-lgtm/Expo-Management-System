# `ExhibitorCard`

Source: [`ExhibitorCard.jsx`](../../src/components/common/ExhibitorCard.jsx)

Displays a linked public exhibitor summary: logo, company name, category,
address, and optional description.

## Props

- `exhibitor`: record with `_id`, `companyName`, `category`, `address`,
  `logo`, and optional `description`.

The full card links to the exhibitor detail route. Logo rendering is delegated
to `ExhibitorLogo`.
