# Retention and deletion

Choose how long to keep requests and notifications in each workspace. Deletion controls depend on the resource and your permissions.

## Set retention

1. Select the workspace and open **Retention**.
2. Review the **Requests** and **Notifications** periods.
3. If your plan and permissions allow changes, choose a period for each and select **Save**.

Personal users manage their own settings. Organization Owners and Admins manage the organization's policy. Free-plan retention is fixed at one month. Other plans can allow different periods, including **Never delete** where offered.

!!! warning "Retention is not a backup"
    Records can be removed by background cleanup after their retention period. Choose a policy that supports your recordkeeping needs before accumulating important workflow history.

## Delete individual records

Use the delete action offered for a request, task, receipt, employee, team, template, or delegation only when you intend to remove that record. Read the confirmation and any validation message.

A relationship from another record can prevent deletion. Resolve the identified relationship where appropriate. Repeated retries do not remove the dependency.

Files associated with deleted workflow records can be scheduled for later cleanup, so their stored content and usage may not disappear immediately. Profile avatars and organization logos can be removed immediately when replaced or deleted.

## Delete an organization

!!! warning "Organization deletion removes access immediately"
    Only the Owner can schedule organization deletion. The organization immediately disappears from workspace selection and becomes inaccessible; background processing removes its data later. Preserve required records before confirming. The cleanup delay is not a recovery option.

## Payment-related removal

Payment suspension has its own deadline. Resolve failed payments through [Plans](plans-and-billing.md) before that deadline. Expiry removes business organizations; Personal workspaces lose workflow data and return to Personal Free while retaining identity and profile. A retention setting does not override this billing recovery process.
