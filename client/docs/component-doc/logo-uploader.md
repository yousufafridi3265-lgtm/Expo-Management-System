# `LogoUploader`

Source: [`LogoUploader.jsx`](../../src/components/exhibitor/LogoUploader.jsx)

Displays the current exhibitor logo and provides a file picker that uploads a
replacement immediately after selection.

## Props

- `profile`: profile record with `logo` and `companyName`.
- `onUploaded(profile)`: receives the updated profile returned by the API.

The client accepts JPG, PNG, and WEBP files up to 2 MB. Invalid files and
upload failures are reported through notifications. The file input is cleared
after a selection so the same file can be selected again.
