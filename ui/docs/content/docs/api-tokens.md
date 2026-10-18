# API tokens

Tokens let integrations access the API through your user account. Manage them in your profile, whether you work in Personal or an organization.

## Create a token

1. Open **User profile → API tokens**.
2. Choose **New API token**.
3. Enter a recognizable name and an expiry if needed.
4. Create the token and copy its value before closing the dialog.
5. Store it securely for the intended integration.

!!! warning "Copy the token before closing"
    The full value is shown only once. Store it securely and keep it out of messages, screenshots, and source control. If you lose it, create a replacement and revoke the old token.

## Use a token

Use the API reference for its endpoint contracts and authentication requirements. Token creation does not grant access to another user's work or another organization's resources; authorization still applies.

## Revoke a token

Select the token in the list, choose **Revoke**, and confirm. Update any integration that used it with a replacement credential. Revoke unused tokens and credentials you suspect have been exposed.

API tokens are account settings. Switching workspaces does not create a separate set of tokens.
