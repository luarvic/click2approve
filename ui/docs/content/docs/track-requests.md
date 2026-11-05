---
title: Track approval status and revise requests
description: Check document approval status in Requests. See recorded decisions, cancel active work, or use Resubmit to start an eligible request with revised files.
---
# Track approval status and revise requests {#track-and-revise-requests}

To check a document's approval status, open **Requests** in the workspace that owns the request. Use **Personal**, your workspace for your own requests, for work you sent personally. For work sent on behalf of an organization, select that organization.

Use the available filters to find the request, then open its details to review files, steps, participants, and recorded actions. For actions assigned to you, open **Tasks** instead; see [Complete a task](complete-a-task.md).

## Read progress and outcomes

Workflow steps appear below the request summary. Each step heading shows its number and action, such as **Step 1 · Approve**. Expand the heading to see the completion rule, visibility, requirements, and original assignees. The assignee icons identify teams, employees, and email addresses. Task cards stay visible when you collapse the step details.

Expand a task to see **Assigned via** if it came from a team assignment. An **Upcoming task** shows someone whose task has not started yet.

**From organization**, when shown on a task, names its recorded organization. Personal is a workspace, not an organization.

The status chip in each request or task card's header shows its current state, including when the card is collapsed.

| State | Meaning |
| --- | --- |
| Pending | Submitted work is waiting to progress |
| Started | The workflow is in progress |
| Completed — Succeeded | The workflow completed successfully |
| Completed — Failed | The workflow completed with an unsuccessful outcome |
| Canceled | The request was stopped |
| Superseded | A newer revision replaced this request |

Individual task actions can have more specific labels, such as Signed or Rejected. A skipped task does not mean that participant made a decision; another outcome may already have resolved the step. Automatically completed requests and skipped or canceled tasks show their status and completion time without a **Completed by** field.

## Cancel a request

Open a pending or started request you are authorized to manage, choose **Cancel request**, and confirm. Cancellation stops the workflow. Reopen the request to check its final state before contacting participants.

## Revise and resubmit

Revise eligible requests in either Personal or an organization.

For example, a reviewer may choose **Request changes** and explain that a proposal has the wrong price. Use **Resubmit** to replace the proposal and start a new review. Adding a file to [Chat](discussions.md) does not replace the request's current review files.

1. Open an eligible request and choose **Resubmit**.
2. Review the previous revision's files, instructions, and workflow steps.
3. Update the files, instructions, and steps for the new revision.
4. Check the participants and choose **Submit**.

Resubmission creates a new revision and supersedes the previous request. The action is offered only on eligible pending, started, or completed requests that have not succeeded and have no newer revision. A successfully completed request cannot be resubmitted through this action.

The new revision starts its workflow from the first step. Earlier decisions remain recorded on the previous revision and its receipts; they do not complete tasks in the new revision. Review every step and participant before submitting again.

Use **Show revision changes**, when present, to inspect added, replaced, and removed files. Replaced or deleted files remain context for the revision and are not part of the current files to review.

## Preserve the result

[Receipts](receipts.md) record the request's result and each participant's recorded actions, subject to step visibility. They are created when a request completes, is canceled, or is replaced by a new revision. Review [retention and deletion](retention.md) before removing a request or relying on long-term access.

A newer revision prevents deletion of the request it references. Schedule deletion of the latest revision first, then wait for background cleanup before removing its predecessor. Removing a request does not remove participants' receipts.
