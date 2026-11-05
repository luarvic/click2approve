---
title: Assign document approval steps to teams
description: Group organization employees into teams and assign approval steps to them. Learn who manages teams and how membership changes affect assigned tasks.
---
# Assign document approval steps to teams {#teams}

Teams group employees within one organization and let you assign a document approval step to a group. For example, create a team for people who review proposals, then choose that team when setting up a review step. The step's completion rule controls whether all assigned people or any one person must respond successfully.

!!! info "Organization only"
    Select an organization to view its teams. Owners and Admins manage team membership.

## Create or update a team

1. Select the organization and open **Teams**.
2. As an Owner or Admin, start a new team or open one to edit.
3. Enter a recognizable **Name**.
4. Choose the organization's **Employees** who belong to the team.
5. Save and review the membership.

Members can view the team directory; Owners and Admins manage it. People from another organization cannot be added as employees of this team.

## Assign work to a team

When configuring a [workflow step](workflow-steps.md), choose **Team** as the assignee type and select the team. Check the step's all-assignees or any-assignee rule so it matches the intended completion requirement.

Membership changes apply to future task assignments. Tasks already assigned to a participant remain theirs after they leave the team.

Team relationships influence which organization tasks and requests are available to a user. When expected work is missing, check both the current workspace and the employee's team membership.

## Remove a team

Use the available delete action when the team is no longer needed. References from other records can prevent deletion. Review the reported relationship before changing assignments or removing a team used by active workflows or templates.
