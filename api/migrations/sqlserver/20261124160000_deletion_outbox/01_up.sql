SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF COL_LENGTH(N'dbo.ApprovalRequests', N'DeletionPublishedAt') IS NOT NULL
BEGIN
    -- Old markers attest only to a queue send. Let the scheduler re-evaluate surviving targets.
    EXEC(N'UPDATE dbo.ApprovalRequests SET DeletionPublishedAt = NULL WHERE DeletionPublishedAt IS NOT NULL');
    EXEC sys.sp_rename N'dbo.ApprovalRequests.DeletionPublishedAt', N'DeletionRequestedAt', N'COLUMN';
END;

IF COL_LENGTH(N'dbo.AuditLogs', N'DeletionPublishedAt') IS NOT NULL
BEGIN
    -- Old markers attest only to a queue send. Let the scheduler re-evaluate surviving targets.
    EXEC(N'UPDATE dbo.AuditLogs SET DeletionPublishedAt = NULL WHERE DeletionPublishedAt IS NOT NULL');
    EXEC sys.sp_rename N'dbo.AuditLogs.DeletionPublishedAt', N'DeletionRequestedAt', N'COLUMN';
END;

IF COL_LENGTH(N'dbo.InAppNotifications', N'DeletionPublishedAt') IS NOT NULL
BEGIN
    -- Old markers attest only to a queue send. Let the scheduler re-evaluate surviving targets.
    EXEC(N'UPDATE dbo.InAppNotifications SET DeletionPublishedAt = NULL WHERE DeletionPublishedAt IS NOT NULL');
    EXEC sys.sp_rename N'dbo.InAppNotifications.DeletionPublishedAt', N'DeletionRequestedAt', N'COLUMN';
END;

IF COL_LENGTH(N'dbo.Tenants', N'DeletionPublishedAt') IS NOT NULL
BEGIN
    -- Old markers attest only to a queue send. Let the scheduler re-evaluate surviving targets.
    EXEC(N'UPDATE dbo.Tenants SET DeletionPublishedAt = NULL WHERE DeletionPublishedAt IS NOT NULL');
    EXEC sys.sp_rename N'dbo.Tenants.DeletionPublishedAt', N'DeletionRequestedAt', N'COLUMN';
END;

IF COL_LENGTH(N'dbo.UserFiles', N'DeletionPublishedAt') IS NOT NULL
BEGIN
    -- Old markers attest only to a queue send. Let the scheduler re-evaluate surviving targets.
    EXEC(N'UPDATE dbo.UserFiles SET DeletionPublishedAt = NULL WHERE DeletionPublishedAt IS NOT NULL');
    EXEC sys.sp_rename N'dbo.UserFiles.DeletionPublishedAt', N'DeletionRequestedAt', N'COLUMN';
END;

IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.Tenants') AND name = N'IX_Tenants_DeletionPublishedAt_ScheduledForDeletionAt')
    EXEC sys.sp_rename N'dbo.Tenants.IX_Tenants_DeletionPublishedAt_ScheduledForDeletionAt', N'IX_Tenants_DeletionRequestedAt_ScheduledForDeletionAt', N'INDEX';

IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.ApprovalRequests') AND name = N'IX_ApprovalRequests_DeletionPublishedAt_ScheduledForDeletionAt')
    EXEC sys.sp_rename N'dbo.ApprovalRequests.IX_ApprovalRequests_DeletionPublishedAt_ScheduledForDeletionAt', N'IX_ApprovalRequests_DeletionRequestedAt_ScheduledForDeletionAt', N'INDEX';

IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.UserFiles') AND name = N'IX_UserFiles_DeletionPublishedAt_ScheduledForDeletionAt')
    EXEC sys.sp_rename N'dbo.UserFiles.IX_UserFiles_DeletionPublishedAt_ScheduledForDeletionAt', N'IX_UserFiles_DeletionRequestedAt_ScheduledForDeletionAt', N'INDEX';

DROP INDEX IF EXISTS IX_EventOutboxMessages_DeletionPublishedAt_OccurredAt ON dbo.EventOutboxMessages;
IF COL_LENGTH(N'dbo.EventOutboxMessages', N'DeletionPublishedAt') IS NOT NULL
    ALTER TABLE dbo.EventOutboxMessages DROP COLUMN DeletionPublishedAt;

COMMIT;
