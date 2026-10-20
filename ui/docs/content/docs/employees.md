# Employees and roles

Employees connect user accounts to an organization and provide the identities used for assignments and audit records.

!!! info "Organization only"
    Select an organization to view its employees. Owners and Admins can add employees and manage their access.

## Add an employee

Owners and Admins can open **Employees**, start a new employee, and enter their email, name, position, role, and teams. Save the employee, then check their status.

The email identifies the account that should receive employee access. Check it before saving. An employee's organization name and position can differ from their personal profile.

An employee whose email has not registered yet starts **Pending**. Registration with that email activates the membership. Adding an already registered account creates an **Active** employee.

## Roles

| Role | Organization permissions |
| --- | --- |
| User (member) | Participate in authorized workflows, view employee, team, and delegation directories, and manage their own templates |
| Admin | Manage employees, teams, delegations, billing, and retention |
| Owner | Administrative management plus the authority to schedule organization deletion |

Roles do not grant access to other organizations. Request and task visibility also follows participation, team relationships, and delegation. Templates remain private to their creator, including when another member is an Owner or Admin.

Receipt access follows receipt ownership, regardless of employee role. Owners and Admins can view, share, and delete only receipts issued to themselves. See [Receipts and verification](receipts.md).

## Employee status

| Status | Meaning |
| --- | --- |
| Pending | Membership has not yet become active |
| Active | Employee access is active |
| Disabled | Employee access has been disabled |

Owners and Admins can edit permitted employee details, team memberships, and the **Active** setting. Disabling access is useful when a person should no longer act for the organization.

## Remove an employee

Use the available delete action only when the employee should be removed. Existing references can prevent deletion; read the validation message and resolve the relevant relationship first. Disabling access can be appropriate when historical relationships must remain.

Before changing membership, review [teams](teams.md) and [delegations](delegations.md) that depend on that employee.
