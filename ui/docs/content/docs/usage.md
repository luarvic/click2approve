# Usage and tokens

Select a workspace and open **Usage** to see its token balance, billing period, and total occupied storage. The action breakdown explains where tokens were spent.

## Monthly allowance

Each plan includes tokens. Personal Free renews monthly from its initial period date. Paid plans renew with their verified paid billing period. Business Trial receives one allowance for its single month. Unused tokens expire; they do not roll over or transfer between workspaces.

| Plan | Monthly price (USD, excluding taxes) | Included tokens | Storage |
| --- | --- | --- | --- |
| Personal Free | $0 | 1,000 per month | 1 GB |
| Personal Pro | $20 | 50,000 per month | 10 GB |
| Business Trial | $0 for one month only | 10,000 once | 1 GB |
| Business Pro | $100 | 300,000 per month | 100 GB |

## What uses tokens

The current rates appear on **Plans**. Initial rates are:

| Action | Tokens |
| --- | --- |
| Upload | 1 per MB |
| View or download a file | 2 per MB |
| Workflow email | 5 per recipient |
| Submit or resubmit a request | 10 |
| Create a task | 2 per task |
| Complete a task | 1 |
| Cancel a request or read a request/task | 0 |

Transfers use decimal MB (1,000,000 bytes). Small files consume fractional tokens, rather than rounding up each file to one MB. File previews also transfer data. Viewing a copy already cached by your browser does not cause another server transfer. Successful file transfers are charged for document bytes, without the data-URL encoding overhead.

For example, 10 MB uploaded, 10 MB downloaded, five emails, one request, and five tasks created and completed use **80 tokens** at these rates.

Requests and tasks are charged to the originating workflow workspace, even when an approver uses a personal inbox. Workflow-context uploads from task and discussion pages are also billed to that workflow workspace. Generic uploads without a workflow context use the selected workspace. Account verification, password resets, security notices, billing emails, and public branding assets do not consume workspace tokens.

## Charging and insufficient tokens

Uploads, downloads, and workflow emails check available tokens before starting and charge completed work directly. Failed uploads and unsent emails are not charged. Interrupted downloads are charged for document bytes transferred. Attaching or deleting an uploaded file does not refund its upload charge.

Simultaneous actions can take the balance below zero; further charged actions are blocked until tokens are available.

Burst and concurrency limits also protect the service. A temporarily rate-limited action can be retried later.

When tokens are insufficient, new charged actions are blocked. Existing records remain accessible when their read price is zero; file viewing and task completion still require tokens. Open **Plans** to review your allowance. Deleting a record does not refund tokens already consumed.

## Storage is a separate limit

Storage measures files currently occupying space, including scheduled files awaiting cleanup. It is not a new upload allowance each month. Keeping a file does not consume additional tokens, but counts against your plan's storage capacity until it is removed.

Choose [retention](retention.md) around how long you need records. A scheduled plan change keeps the current paid entitlement until it becomes effective. A paid upgrade activates after verified payment; it does not grant tokens merely because Checkout was opened.
