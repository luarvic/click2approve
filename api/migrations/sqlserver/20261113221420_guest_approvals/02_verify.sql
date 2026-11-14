-- Run after 01_up.sql. These checks do not modify application data.
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.ApprovalRequestStepAssignees')
    AND name = N'AccountSignInRequired' AND TYPE_NAME(user_type_id) = N'bit' AND is_nullable = 0)
    THROW 51000, 'ApprovalRequestStepAssignees.AccountSignInRequired must be a non-nullable bit.', 1;
IF NOT EXISTS (SELECT 1 FROM sys.default_constraints AS d JOIN sys.columns AS c
    ON c.object_id = d.parent_object_id AND c.column_id = d.parent_column_id
    WHERE c.object_id = OBJECT_ID(N'dbo.ApprovalRequestStepAssignees') AND c.name = N'AccountSignInRequired'
        AND REPLACE(REPLACE(d.definition, N'(', N''), N')', N'') = N'1')
    THROW 51000, 'AccountSignInRequired must default to true.', 1;
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.ApprovalRequestTasks')
    AND name = N'CompletedViaEmailLink' AND TYPE_NAME(user_type_id) = N'bit' AND is_nullable = 1)
    THROW 51000, 'ApprovalRequestTasks.CompletedViaEmailLink must be a nullable bit.', 1;
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID(N'dbo.ApprovalRequestStepAssignees')
    AND name = N'CK_ApprovalRequestStepAssignees_AccountSignInRequired' AND is_disabled = 0 AND is_not_trusted = 0)
    THROW 51000, 'The account sign-in constraint must be enabled and trusted.', 1;
IF EXISTS (SELECT 1 FROM dbo.ApprovalRequestStepAssignees WHERE [Type] <> 0 AND AccountSignInRequired <> 1)
    THROW 51000, 'Employee and team assignees must require account sign-in.', 1;
