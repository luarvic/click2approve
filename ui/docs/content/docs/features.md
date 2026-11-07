---
title: Document approval features and workspace access
description: See which Click2Approve features work in Personal and organization workspaces, including approval steps, signatures, teams, templates, and receipts.
---
# Document approval features and workspace access {#features-and-availability}

Click2Approve combines document review, approval steps, electronic signatures, and request tracking. Use **Personal**, your workspace for your own requests and email-addressed tasks, for individual work. Use an organization workspace for shared business workflows. Your workspace, role, and plan determine which actions you can take.

You can also connect your own tools through the Click2Approve API. See [API tokens](api-tokens.md) to create credentials and authenticate integration requests.

!!! info "Organization only"
    Employees, teams, delegations, and workflow templates belong to organizations. Select an organization in the workspace picker to use them. Other features in this guide are also available in Personal.

## How document approval works

1. [Create a request](create-a-request.md) with the documents and instructions.
2. [Configure workflow steps](workflow-steps.md) to choose who acts and in what order. Several people can review at the same step.
3. Participants open **Tasks** to [record their decisions](complete-a-task.md). A step can require a comment, electronic signature, or response file.
4. Open **Requests** to [check progress](track-requests.md). When the request finishes, [receipts](receipts.md) preserve its result and recorded actions.

For example, two reviewers can check a proposal in the first step. A client can then sign in the next step. Enable **Require an electronic signature** on that step if you need a drawn signature.

## Workspace reference

| Feature | Personal | Organization |
| --- | --- | --- |
| Requests, tasks, ordered steps, and email assignees | Available | Available |
| Required comments and electronic signatures | Available | Available |
| Discussions and discussion attachments | Available | Available |
| Task response attachments | Available | Available |
| Request revisions | Available for eligible requests | Available for eligible requests |
| Employees and employee assignees | — | Available |
| Teams and team assignees | — | Available |
| Delegations | — | Available |
| Workflow templates | — | Create your own and reuse templates shared within the organization |
| Receipts and verification links | View, share, and delete receipts issued to you | Every member can view, share, and delete receipts issued to them |
| Plans, usage, and retention | Manage your own plan and settings | Owners and Admins manage the plan and settings |
| Profile, saved signature, MFA, passkeys, and API tokens | Account settings | The same account settings across workspaces |

## Organization permissions

Members can view employee, team, and delegation directories. Owners and Admins manage employees, teams, delegations, billing, and retention. Templates are private by default; their creators can share them for other organization members to view and use. Only the creator can edit or delete a template. Receipt access is limited to the user each receipt is issued to. Only the Owner can schedule organization deletion.

Access to a request or task depends on participation, team relationships, and delegation. Organization membership alone does not expose every workflow or grant access to another organization's records.

See [Employees and roles](employees.md) for the role reference and [Usage and limits](usage.md) for plan restrictions. Open **Plans** for your current allowances and available plan choices.
