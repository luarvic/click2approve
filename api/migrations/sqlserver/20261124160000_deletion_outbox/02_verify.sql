IF COL_LENGTH(N'dbo.ApprovalRequests', N'DeletionRequestedAt') IS NULL THROW 51001, 'Missing ApprovalRequests scheduling marker.', 1;
IF COL_LENGTH(N'dbo.AuditLogs', N'DeletionRequestedAt') IS NULL THROW 51001, 'Missing AuditLogs scheduling marker.', 1;
IF COL_LENGTH(N'dbo.InAppNotifications', N'DeletionRequestedAt') IS NULL THROW 51001, 'Missing InAppNotifications scheduling marker.', 1;
IF COL_LENGTH(N'dbo.Tenants', N'DeletionRequestedAt') IS NULL THROW 51001, 'Missing Tenants scheduling marker.', 1;
IF COL_LENGTH(N'dbo.UserFiles', N'DeletionRequestedAt') IS NULL THROW 51001, 'Missing UserFiles scheduling marker.', 1;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.Tenants') AND name = N'IX_Tenants_DeletionRequestedAt_ScheduledForDeletionAt') THROW 51002, 'Missing IX_Tenants_DeletionRequestedAt_ScheduledForDeletionAt.', 1;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.ApprovalRequests') AND name = N'IX_ApprovalRequests_DeletionRequestedAt_ScheduledForDeletionAt') THROW 51002, 'Missing IX_ApprovalRequests_DeletionRequestedAt_ScheduledForDeletionAt.', 1;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.UserFiles') AND name = N'IX_UserFiles_DeletionRequestedAt_ScheduledForDeletionAt') THROW 51002, 'Missing IX_UserFiles_DeletionRequestedAt_ScheduledForDeletionAt.', 1;
IF COL_LENGTH(N'dbo.EventOutboxMessages', N'DeletionPublishedAt') IS NOT NULL THROW 51003, 'Obsolete outbox marker remains.', 1;
