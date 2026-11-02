# `CompanyProfileForm`

Source: [`CompanyProfileForm.jsx`](../../src/components/exhibitor/CompanyProfileForm.jsx)

Controlled form for creating or updating an exhibitor company profile.
Initial values are selected from the profile record; the parent owns saving.

## Props

- `initialValues`: optional profile used to populate the form.
- `submitLabel`: text displayed on the submit button.
- `onSubmit(data)`: async callback receiving trimmed company name, category,
  phone, address, and description.

Company name is required and limited to 150 characters. Category, phone, and
address are also required. Callback errors are reported through notifications.
