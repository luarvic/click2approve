---
title: Configure workflow steps
description: Choose sequential or parallel reviewers, all or any completion, comments, and electronic signatures.
---
# Configure workflow steps {#configure-workflow-steps}

A workflow defines who acts and in what order. Steps run one after another; several assignees can act within the same step.

Use **Add step** to add a step, the arrow controls to reorder steps, and the remove button to delete a step.

## Choose an action and participants

Select an **Action**, write **Instructions**, and add assignees by email. Available actions are Approve, Sign, Confirm, Acknowledge, Review, Verify, Accept, and Complete.

Check each address before submitting. All assignees must sign in with an account using that address on this installation.

## Sequential and parallel approvals

| You need… | Configure the workflow this way |
| --- | --- |
| One person followed by another | Put each person in a separate step |
| Several people who must all approve | Put them in one step and enable **All assignees must complete** |
| Approval from any one person | Put them in one step and leave **All assignees must complete** disabled |
| Approval followed by a signature | Add an approval step followed by a signing step with **Require an electronic signature** enabled |

With the all-assignees rule disabled, one successful response completes the step and skips other pending tasks. A negative decision fails the request; other assignees cannot override a rejection.

## Additional requirements

Enable **Require a comment** to collect an explanation or **Require an electronic signature** to collect a legal name and drawn signature. The action and signature requirement are separate controls.

See [Complete a task](complete-a-task.md) for the participant's experience.

## Step visibility

The requester and the step's assignees can see that step. **Visibility** controls whether other participants can see its details. Choose **All participants** to share with the request's participants or **Assignees only** to limit the audience.

These settings do not grant access to unrelated requests.
