---
title: Configure document approval workflow steps
description: Set up approval steps in order or let several reviewers act at one step. Choose all or any assignee, required signatures, comments, and attachments.
---
# Configure document approval workflow steps {#configure-workflow-steps}

An approval workflow defines who acts on a document and in what order. An **assignee** is a person or team assigned to a step. Steps run one after another. Several assignees can act at the same step.

Use **Add step** to create another step, the arrow controls to change its order, and the remove button to delete it.

## Sequential and parallel approvals

Use separate steps when one decision must come before another. This is a **sequential approval**. For example, a reviewer approves a proposal in step 1, then a client signs in step 2.

Put people in the same step when they can review at the same time. This is a **parallel approval** within that step. Steps themselves still run in order.

| You need… | Configure the workflow this way |
| --- | --- |
| One reviewer, followed by another | Add a separate step for each reviewer |
| Two reviewers who must both approve | Add both to one step and enable **All assignees must complete** |
| Approval from any one of several people | Add them to one step and leave **All assignees must complete** disabled |
| Approval followed by a drawn signature | Add an **Approve** step, then a **Sign** step with **Require an electronic signature** enabled |

## Choose an action and participants

For each step, select an **Action** and add clear **Instructions**. Supported actions are Approve, Sign, Confirm, Acknowledge, Review, Verify, Accept, and Complete. Choose the action that matches the decision you need recorded.

Add assignees by email and check the displayed names and addresses before submitting.

!!! info "Organization assignees"
    In an organization, select **Employee** or **Team** to assign work within the current organization. These assignee types are unavailable in Personal.

## Require everyone or any assignee

Enable **All assignees must complete** to require a successful response from every assignee. With this option disabled, one successful response completes the step and skips its other pending tasks. The switch appears when a step has several assignees or a team assignment.

A negative decision stops the request with an unsuccessful outcome, even when **All assignees must complete** is disabled. The option does not allow other assignees to override a rejection.

For example, use one step for two reviewers who must both act, followed by a separate signing step. Use the any-assignee option when one available participant can provide the required decision.

## Additional requirements

The **Additional requirements** and **Visibility** sections stay visible in each step while creating or revising a request or editing a template. Review their settings before saving or submitting.

Enable the requirements the participant must satisfy:

- **Require a comment** to collect an explanation.
- **Require an electronic signature** to collect signing details and a drawn signature.
- **Require an attachment** to collect a response file.

The action label and electronic signature requirement are separate settings. Enable the signature requirement when a drawn signature is needed. Review the requirements together with the selected action so participants know what to provide. See [Complete a task](complete-a-task.md).

## Step visibility

The requester and a step's direct assignees can always see that step, including email assignees. **Visibility** controls who else can see its details and response attachments:

| Setting | Additional audience |
| --- | --- |
| All participants | Participants with access to the request |
| Assignees and organization participants | Organization participants; available for organization workflows |
| Assignees only | No additional participants |

Email assignments remain in the recipient’s Personal workspace, even when their email belongs to an organization employee. Assigned steps remain visible in the workflow, available for step chat, and included in the recipient’s receipt.

These settings do not grant workspace membership or access to unrelated requests. Choose a restricted setting when other participants do not need the step's details.

## Revisions

When [resubmitting a request](track-requests.md), review and edit the steps for the new revision. Its workflow starts again from the first step; previous decisions remain recorded on the previous revision and its receipts. For frequently used organization workflows, save the steps as a [template](templates.md).
