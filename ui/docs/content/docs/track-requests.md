# Track and revise requests

Open **Requests** in the workspace that owns the request. Use the available filters to find it, then open its details to review files, steps, participants, and recorded actions.

## Read progress and outcomes

Workflow steps appear below the request summary. Each step heading shows its number and action, such as **Step 1 · Approve**. Use its expand control to show a wrapping row of icons and values for the completion rule, visibility, any requirements, and original assignees. These details start collapsed. Full-width task cards remain visible when the step details are collapsed. Assignee icons identify the original teams, employees, and email addresses. Tasks appear in one list without team groups; expand a task to see **Assigned via** when it was created from a team assignment. An **Upcoming task** shows an assignee whose task has not started yet. **From organization**, when present on an existing task, identifies its recorded organization; Personal is a workspace, not an organization.

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

1. Open an eligible request and choose **Resubmit**.
2. Review the previous revision's files, instructions, and workflow steps.
3. Update the files, instructions, and steps for the new revision.
4. Check the participants and choose **Submit**.

Resubmission creates a new revision and supersedes the previous request. The action is offered only on eligible pending, started, or completed requests that have not succeeded and have no newer revision. A successfully completed request cannot be resubmitted through this action.

The new revision starts its workflow from the first step. Earlier decisions remain recorded on the previous revision and its receipts; they do not complete tasks in the new revision. Review every step and participant before submitting again.

Use **Show revision changes**, when present, to inspect added, replaced, and removed files. Replaced or deleted files remain context for the revision and are not part of the current files to review.

## Preserve the result

[Receipts](receipts.md) provide completed request snapshots. Review [retention and deletion](retention.md) before removing a request or relying on long-term access.

A newer revision prevents deletion of the request it references. Schedule deletion of the latest revision first, then wait for background cleanup before removing its predecessor. Removing a request does not remove participants' receipts.
