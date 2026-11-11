---
title: Open-source document approval system
description: Self-host Click2Approve, a free MIT-licensed document approval system with multi-step workflows, multiple reviewers, and electronic signatures. Compare editions.
---
# Open-source document approval system

Click2Approve is a free, MIT-licensed open-source document approval system that you can host on your own infrastructure. Upload documents, assign reviewers by email address, and track their decisions through a multi-step approval workflow. You can request electronic signatures and require comments when a task needs an explanation.

The open-source edition supports individual accounts and personal document workflows for personal or commercial use. There is no Click2Approve license fee; you cover your infrastructure and provider costs. See the [source code and self-hosting instructions](https://github.com/luarvic/click2approve) to get started.

The commercial version adds organization workspaces, collaboration tools, and subscription-based usage and retention controls. The other guides in this portal describe the commercial service; use this comparison to check which features apply to the open-source edition.

## Example: review and approve a proposal

1. Upload a proposal and add an approval step for the people who need to review it.
2. Choose whether everyone assigned to the step must respond or any one reviewer can complete it. Workflow steps run in order, with multiple assignees able to act within each step.
3. Add a signing step if the proposal also needs an electronic signature.
4. Track the request's progress and recorded decisions from **Requests**. Each participant finds their assigned work in **Tasks**.

See [Create a request](create-a-request.md) and [Configure workflow steps](workflow-steps.md) for the workflow controls. Shareable receipts and file verification are commercial features; see the comparison below when choosing an edition.

## Feature comparison

| Feature | Open-source | Commercial |
| --- | --- | --- |
| Personal requests and tasks with uploaded files | Included | Included |
| Multiple workflow steps, serial or parallel assignees, and all/any completion rules | Included | Included |
| Approval, signature, confirmation, acknowledgement, review, verification, acceptance, and completion actions | Included | Included |
| Required comments and electronic signatures | Included | Included |
| Request tracking, cancellation, and deletion | Included | Included |
| Profiles, saved signatures, password sign-in, MFA, and passkeys | Included | Included |
| Email and in-app notifications | Included | Included |
| Organization workspaces, employees, roles, and employee assignees | Unavailable | Included |
| Teams and team assignees | Unavailable | Included |
| Delegations | Unavailable | Included |
| Organization workflow templates | Unavailable | Included |
| Discussions and discussion attachments | Unavailable | Included |
| Task response attachments and required response files | Unavailable | Included |
| Request revisions and file comparisons between revisions | Unavailable | Included |
| Receipts, shareable verification links, and file verification | Unavailable | Included |
| API tokens for integrations | Unavailable | Included |
| Subscription plans, token usage reporting, and billing | Unavailable | Included |
| Workspace retention settings and automatic retention cleanup | Unavailable | Included |

Commercial features depend on your workspace, role, participation, and plan limits. See [Features and availability](features.md) for workspace permissions and [Plans and billing](plans-and-billing.md) for subscriptions. Email delivery in a self-hosted installation requires an email provider.

## Use the open-source app

1. Sign up or sign in with your account.
2. Choose **New request**, upload your files, and configure workflow steps with assignees' email addresses. See [Create a request](create-a-request.md) and [Configure workflow steps](workflow-steps.md) for the shared workflow controls.
3. Use **Requests** to track work you sent and **Tasks** to complete actions assigned to you. See [Complete a task](complete-a-task.md) for comments and signatures; response attachments are available in the commercial version.

Organization navigation and commercial tools are hidden in the open-source app. You can manage your profile, saved signature, notification preferences, MFA, and passkeys through the profile menu.

## Source and self-hosting

See the [open-source repository](https://github.com/luarvic/click2approve) for source code, the MIT license, Docker setup, and self-hosting instructions. Visit the [Click2Approve service](../index.md) for the commercial version.
