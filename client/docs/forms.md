# Form Components

This document describes the reusable form controls in
[`../src/components/forms`](../src/components/forms). The folder contains
`FormField`, `Input`, `Select`, and `Textarea`.

## Components

| Component | Purpose | Props and behavior |
| --- | --- | --- |
| `FormField` | Shared layout for a label, form control, required marker, and validation error. | `id`, `label`, `error`, `required`, and `children`. Used by the form controls to associate the label with its control and the error text with an ID derived from the control ID. |
| `Input` | Labeled native `<input>` control. | `label`, `error`, `required`, `className`, and standard input props such as `type`, `name`, `value`, and `onChange`. Generates its own ID with React `useId()`. |
| `Select` | Labeled native `<select>` control. | `label`, `error`, `required`, `options`, `placeholder`, `className`, and standard select props such as `value` and `onChange`. Each option has `value` and `label`. |
| `Textarea` | Labeled native `<textarea>` control. | `label`, `error`, `required`, `rows` (defaults to `4`), `className`, and standard textarea props such as `value` and `onChange`. |

## Field labels and validation errors

`Input`, `Select`, and `Textarea` create an ID with `useId()` and pass it to
`FormField`. When `label` is provided, `FormField` renders a label associated
with that ID. When `required` is true, the field receives the native HTML
`required` attribute and the label displays a required marker.

When an `error` is provided, each control:

- Applies the `field-error` class.
- Sets `aria-invalid` to `true`.
- Sets `aria-describedby` to the associated error paragraph ID.

`FormField` renders the error text in an element with `role="alert"`. Without
an error, `aria-describedby` is not set.

## Select options

Pass `options` as an array of objects with `value` and `label` properties:

```js
[
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" }
]
```

If `placeholder` is provided, `Select` adds it as the first option with an
empty-string value. `options` defaults to an empty array.

## Usage example

```jsx
import Input from "../components/forms/Input";
import Select from "../components/forms/Select";
import Textarea from "../components/forms/Textarea";

function CompanyForm() {
  return (
    <form>
      <Input
        label="Company name"
        name="companyName"
        value={companyName}
        onChange={handleChange}
        required
        error={errors.companyName}
      />

      <Select
        label="Category"
        name="category"
        value={category}
        onChange={handleChange}
        options={[
          { value: "technology", label: "Technology" },
          { value: "food", label: "Food" }
        ]}
        placeholder="Choose a category"
      />

      <Textarea
        label="Description"
        name="description"
        value={description}
        onChange={handleChange}
        rows={5}
      />
    </form>
  );
}
```

The example assumes the parent component defines `companyName`, `category`,
`description`, `errors`, and `handleChange`. These controls forward remaining
native HTML props to their respective elements.

## Styling

Form controls use the shared `field` class and append `field-error` when an
error is present. Labels and error text use the `form-label`,
`form-required`, and `form-error` classes defined in
[`../src/styles/components.css`](../src/styles/components.css).

Related general-purpose controls and other shared UI elements are described
in [`common-components.md`](./common-components.md).
