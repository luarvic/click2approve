-- Apply before deploying guest approvals; preserves all existing rows and sign-in requirements.
SET XACT_ABORT ON;
BEGIN TRY
    BEGIN TRANSACTION;
    IF COL_LENGTH(N'dbo.ApprovalRequestStepAssignees', N'AccountSignInRequired') IS NULL
        ALTER TABLE dbo.ApprovalRequestStepAssignees ADD AccountSignInRequired bit NOT NULL
            CONSTRAINT DF_ApprovalRequestStepAssignees_AccountSignInRequired DEFAULT (1) WITH VALUES,
            CONSTRAINT CK_ApprovalRequestStepAssignees_AccountSignInRequired CHECK ([Type] = 0 OR [AccountSignInRequired] = 1);
    IF COL_LENGTH(N'dbo.ApprovalRequestTasks', N'CompletedViaEmailLink') IS NULL
        ALTER TABLE dbo.ApprovalRequestTasks ADD CompletedViaEmailLink bit NULL;
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
