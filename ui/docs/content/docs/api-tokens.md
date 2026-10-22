# API tokens

Use the Click2Approve API to connect your own tools and automate approval workflows. API tokens let integrations access the API through your user account. Manage them in your profile, whether you work in Personal or an organization.

## Create a token

1. Open **User profile → API tokens**.
2. Choose **New API token**.
3. Enter a recognizable name and an expiry if needed.
4. Create the token and copy its value before closing the dialog.
5. Store it securely for the intended integration.

!!! warning "Copy the token before closing"
    The full value is shown only once. Store it securely and keep it out of messages, screenshots, and source control. If you lose it, create a replacement and revoke the old token.

## Explore the API

Open the [API reference (Swagger UI)]({{ api_reference_url }}){target="_blank" rel="noopener noreferrer"} to browse endpoints, request fields, and responses.

To try an authenticated request, choose **Authorize**, paste your API token without the `Bearer` prefix, and confirm. Swagger adds the authorization header for you. Choose an endpoint, select **Try it out**, fill in the required fields, and select **Execute**. These requests use your account and can create, change, or delete real data.

Account security endpoints require an interactive sign-in session and cannot be used with API tokens.

## Use a token in your integration

Send your token in the `Authorization` header with each API request:

```http
Authorization: Bearer YOUR_API_TOKEN
```

Replace `YOUR_API_TOKEN` with the value you copied when creating the token. Tokens act with your account's permissions. Token creation does not grant access to another user's work or another organization's resources; authorization still applies.

## Revoke a token

Select the token in the list, choose **Revoke**, and confirm. Update any integration that used it with a replacement credential. Revoke unused tokens and credentials you suspect have been exposed.

API tokens are account settings. Switching workspaces does not create a separate set of tokens.
