# Transactional email templates

Account and notification emails use `EmailLayout` in the Application project. The layout
renders encoded plain-text content with a 600px table shell, the existing Click2Approve
logo-only header and large event heading, one rounded primary action in the logo green (`#22C55E`) with white text, and a contextual footer. Small builders in
`AccountEmailTemplates` and `NotificationEmailTemplates` own the copy; the old
`Email:Templates` configuration entries are no longer used.

## Sender and branding

- `Email:FromEmailAddress` defaults to `DoNotReply@click2approve.com`. Override this
  with the deployment's verified Azure Communication Services sender when necessary.
  Configure the provider's sender display name as `Click2Approve`. Actors are never used
  as sender addresses or reply-to addresses.
- `Email:LogoUrl` optionally overrides the logo with an absolute HTTP(S) image URL.
  By default the worker uses `UI:BaseUrl` + `UI:AppPath` + `/logo-with-text.png`.
  The frontend asset includes the Click2Approve wordmark.
- Deploy the frontend asset alongside the worker changes. The logo has a Click2Approve text alternative; the footer also names the platform.
- Notifications use plain prose below the heading: personal user name, or employee name/position
  at the organization, followed by the requested action (for example, "John Smith requested
  your signature on **New car 1500**."). Missing name parts are omitted and
  email is the fallback. Employee snapshots use the same formatter as UI request data.
- The request title is bold inline in that sentence, with no separate title or attribution card.
  Actor avatars, organization logos, and a standalone `by` label are not rendered.
- Sentence text before and after the title is encoded separately from the bold title; callers
  cannot inject markup. Identity emails also use the logo-only header and enlarged heading.

## Rendering and event context

All five notification types have templates. Action wording covers approve, sign,
confirm, acknowledge, review, verify, accept, and complete. Final request wording
separates declined, canceled, replaced, and successful results; an unknown result
never claims success. Automatic task completion is always attributed to Click2Approve.
Discussion previews normalize whitespace and contain at most 200 Unicode text elements.

`NotificationCommand.SourceGlobalId` and `NotificationEventPayload.SourceGlobalId` are
optional rendering context. Step completion producers identify the completed task;
commercial discussion producers identify the exact discussion message. Navigation IDs,
recipients, preferences, and workflow transitions are unchanged. Automatic task completion
identifies a representative task from the existing per-recipient group. Old queued events
without source IDs use neutral content rather than guessing the latest actor or message.
Deploy consumers before producers when rolling out the optional field.

Email notification links use `/tenants/{tenantGlobalId}/tasks/{taskGlobalId}` for assignees
and `/tenants/{tenantGlobalId}/requests/{requestGlobalId}` for requesters, with `/chat` for
conversation links. The tenant comes from the recipient's notification scope. Legacy
automatic completion events without a source task use the recipient's most recently
completed task for that request. Links never substitute an inbox for a resource.

Protected deep links redirect anonymous visitors to sign-in with a validated internal
`returnUrl`, retaining the path, query, and fragment. Password/passkey sign-in, sign-up,
and password reset resume that destination. A pending destination remains in this browser's
local storage for up to 24 hours to support confirmation emails opened in a new tab, and is
removed when reached. Confirmation on a different browser/device does not share this state.
Tenant membership and resource authorization still apply after authentication.

Account emails retain their existing token conversion. Email-change
confirmations use the original Identity callback, retaining `changedEmail` and the token;
the current UI confirmation page does not support forwarding that parameter. No expiry
is claimed because the email event does not carry the effective token lifetime. Employee
invitations share the layout and retain their sign-up/sign-in destinations.

The renderer accepts plain text, HTML-encodes it once, and permits only absolute HTTP(S)
action/image URLs. It uses inline styles, presentation tables, and an Outlook fixed-width
wrapper. Automated tests verify content and link preservation; rendering in actual email
clients remains a deployment validation step.

## Consumer logging

The consumer continuously polls the priority queues, including when there are no events.
`EventQueue:Consumer:IdleDelaySeconds` controls the delay after an empty poll; each configured
worker polls independently. `Logging:LogLevel:Azure.Core` defaults to `Warning` to suppress
routine Azure HTTP request/response logs while retaining SDK warnings and errors. Set it to
`Information` temporarily when diagnosing Azure requests. A successful email submission
(`202 Accepted`) means Azure accepted the send operation, not that inbox delivery is confirmed.

## Azure sender display name

The Gmail-visible sender display name is an Azure Email Communication Service domain
sender-username property, separate from the HTML templates and `Email:FromEmailAddress`.
Keep the verified address `DoNotReply@click2approve.com`; update that sender's display name
to `Click2Approve` using an authenticated management session:

```sh
az communication email domain sender-username update \
  --resource-group '<resource-group>' \
  --email-service-name '<email-service>' \
  --domain-name click2approve.com \
  --sender-username donotreply \
  --username DoNotReply \
  --display-name Click2Approve
```

Use the resource's actual sender-username identifier if it differs from the mailbox spelling.
See the [Azure sender-username CLI reference](https://learn.microsoft.com/en-us/cli/azure/communication/email/domain/sender-username#az-communication-email-domain-sender-username-update).
