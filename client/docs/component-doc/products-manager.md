# `ProductsManager`

Source: [`ProductsManager.jsx`](../../src/components/exhibitor/ProductsManager.jsx)

Lists products on the exhibitor profile and lets the owner add or remove
products. Each change submits the full updated product list to the profile API.

## Props

- `products`: current product array; each item has a name and optional
  description.
- `onChanged(profile)`: receives the updated profile after a successful save.

Product name is required and limited to 100 characters. Removal requires
confirmation. Request success and failure are communicated through
notifications.
