using Click2Approve.Domain.Models;
using Click2Approve.Domain.Validation;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.Infrastructure.Persistence;

/// <summary>Configures explicit text ceilings and persisted scalar invariants.</summary>
internal static class TextConstraints
{
    public static void Configure(ModelBuilder modelBuilder, bool sqlServer)
    {
        modelBuilder.Entity<AppUser>().Property(entity => entity.DefaultSignatureJson).HasMaxLength(FieldLimits.Signature);
        AddTextCheck<AppUser>(modelBuilder, nameof(AppUser.DefaultSignatureJson), FieldLimits.Signature, sqlServer);
        modelBuilder.Entity<AppUser>().Property(entity => entity.FirstName).HasMaxLength(FieldLimits.Name);
        modelBuilder.Entity<AppUser>().Property(entity => entity.LastName).HasMaxLength(FieldLimits.Name);
        modelBuilder.Entity<ApprovalRequest>().Property(entity => entity.CompletedByDisplayName).HasMaxLength(FieldLimits.ParticipantDisplayName);
        modelBuilder.Entity<ApprovalRequest>().Property(entity => entity.Description).HasMaxLength(FieldLimits.Text);
        modelBuilder.Entity<ApprovalRequest>()
            .Property(entity => entity.OrganizationDisplayName)
            .HasMaxLength(FieldLimits.Name);
        modelBuilder.Entity<ApprovalRequest>().Property(entity => entity.RequesterDisplayName).HasMaxLength(FieldLimits.ParticipantDisplayName);
        modelBuilder.Entity<ApprovalRequest>().Property(entity => entity.SubmittedByDisplayName).HasMaxLength(FieldLimits.ParticipantDisplayName);
        modelBuilder.Entity<ApprovalRequest>().Property(entity => entity.Title).HasMaxLength(FieldLimits.Name);
        modelBuilder.Entity<ApprovalRequestStep>().Property(entity => entity.Instructions).HasMaxLength(FieldLimits.Text);
        modelBuilder.Entity<ApprovalRequestStepAssignee>().Property(entity => entity.AssigneeDisplayName).HasMaxLength(FieldLimits.ParticipantDisplayName);
        modelBuilder.Entity<ApprovalRequestTask>()
            .Property(entity => entity.AssigneeBrowserData)
            .HasMaxLength(FieldLimits.Details);
        modelBuilder.Entity<ApprovalRequestTask>().Property(entity => entity.AssigneeDisplayName).HasMaxLength(FieldLimits.ParticipantDisplayName);
        modelBuilder.Entity<ApprovalRequestTask>().Property(entity => entity.AssigneeIpAddress).HasMaxLength(FieldLimits.IpAddress);
        modelBuilder.Entity<ApprovalRequestTask>()
            .Property(entity => entity.AssigneeLegalName)
            .HasMaxLength(FieldLimits.Name);
        modelBuilder.Entity<ApprovalRequestTask>()
            .Property(entity => entity.AssigneeRepresentationDetails)
            .HasMaxLength(FieldLimits.Details);
        modelBuilder.Entity<ApprovalRequestTask>()
            .Property(entity => entity.AssigneeSignatureJson)
            .HasMaxLength(FieldLimits.Signature);
        AddTextCheck<ApprovalRequestTask>(modelBuilder, nameof(ApprovalRequestTask.AssigneeSignatureJson), FieldLimits.Signature, sqlServer);
        modelBuilder.Entity<ApprovalRequestTask>().Property(entity => entity.Comment).HasMaxLength(FieldLimits.Text);
        modelBuilder.Entity<ApprovalRequestTask>().Property(entity => entity.CompletedByDisplayName).HasMaxLength(FieldLimits.ParticipantDisplayName);
        modelBuilder.Entity<ApprovalRequestTask>().Property(entity => entity.Description).HasMaxLength(FieldLimits.Text);
        modelBuilder.Entity<ApprovalRequestTask>().Property(entity => entity.Instructions).HasMaxLength(FieldLimits.Text);
        modelBuilder.Entity<ApprovalRequestTask>()
            .Property(entity => entity.OrganizationDisplayName)
            .HasMaxLength(FieldLimits.Name);
        modelBuilder.Entity<ApprovalRequestTask>().Property(entity => entity.Title).HasMaxLength(FieldLimits.Name);
        modelBuilder.Entity<AuditLog>().Property(entity => entity.ChangesJson).HasMaxLength(FieldLimits.AuditChanges);
        AddTextCheck<AuditLog>(modelBuilder, nameof(AuditLog.ChangesJson), FieldLimits.AuditChanges, sqlServer);
        modelBuilder.Entity<AuditLog>().Property(entity => entity.EntityState).HasMaxLength(FieldLimits.AuditEntityState);
        modelBuilder.Entity<AuditLog>().Property(entity => entity.EntityType).HasMaxLength(FieldLimits.Name);
        modelBuilder.Entity<EventOutboxMessage>().Property(entity => entity.EventType).HasMaxLength(FieldLimits.EventType);
        modelBuilder.Entity<EventOutboxMessage>().Property(entity => entity.Payload).HasMaxLength(FieldLimits.EventPayload);
        AddTextCheck<EventOutboxMessage>(modelBuilder, nameof(EventOutboxMessage.Payload), FieldLimits.EventPayload, sqlServer);
        modelBuilder.Entity<InAppNotification>().Property(entity => entity.Summary).HasMaxLength(FieldLimits.NotificationSummary);
        modelBuilder.Entity<Tenant>().Property(entity => entity.Address).HasMaxLength(FieldLimits.Details);
        modelBuilder.Entity<Tenant>().Property(entity => entity.BusinessName).HasMaxLength(FieldLimits.Name);
        modelBuilder.Entity<Tenant>().Property(entity => entity.Email).HasMaxLength(FieldLimits.Email);
        modelBuilder.Entity<Tenant>().Property(entity => entity.Phone).HasMaxLength(FieldLimits.Phone);
        modelBuilder.Entity<Tenant>().Property(entity => entity.WebsiteUrl).HasMaxLength(FieldLimits.Url);
        modelBuilder.Entity<UserFile>().Property(entity => entity.Name).HasMaxLength(FieldLimits.Name);
        modelBuilder.Entity<UserFile>().Property(entity => entity.Type).HasMaxLength(FieldLimits.Name);
        modelBuilder.Entity<IdentityRole<long>>().Property(entity => entity.Name).HasMaxLength(FieldLimits.IdentityRoleName);
        modelBuilder.Entity<IdentityRole<long>>().Property(entity => entity.NormalizedName).HasMaxLength(FieldLimits.IdentityRoleName);
        modelBuilder.Entity<IdentityRole<long>>().Property(entity => entity.ConcurrencyStamp).HasMaxLength(FieldLimits.IdentityStamp);
        modelBuilder.Entity<AppUser>().Property(entity => entity.UserName).HasMaxLength(FieldLimits.IdentityUserName);
        modelBuilder.Entity<AppUser>().Property(entity => entity.NormalizedUserName).HasMaxLength(FieldLimits.IdentityUserName);
        modelBuilder.Entity<AppUser>().Property(entity => entity.Email).HasMaxLength(FieldLimits.Email);
        modelBuilder.Entity<AppUser>().Property(entity => entity.NormalizedEmail).HasMaxLength(FieldLimits.Email);
        modelBuilder.Entity<AppUser>().Property(entity => entity.PhoneNumber).HasMaxLength(FieldLimits.Phone);
        modelBuilder.Entity<AppUser>().Property(entity => entity.PasswordHash).HasMaxLength(FieldLimits.IdentityPasswordHash);
        modelBuilder.Entity<AppUser>().Property(entity => entity.SecurityStamp).HasMaxLength(FieldLimits.IdentityStamp);
        modelBuilder.Entity<AppUser>().Property(entity => entity.ConcurrencyStamp).HasMaxLength(FieldLimits.IdentityStamp);
        modelBuilder.Entity<IdentityUserLogin<long>>().Property(entity => entity.LoginProvider).HasMaxLength(FieldLimits.IdentityLoginProvider);
        modelBuilder.Entity<IdentityUserLogin<long>>().Property(entity => entity.ProviderKey).HasMaxLength(FieldLimits.IdentityProviderKey);
        modelBuilder.Entity<IdentityUserLogin<long>>().Property(entity => entity.ProviderDisplayName).HasMaxLength(FieldLimits.Name);
        modelBuilder.Entity<IdentityUserToken<long>>().Property(entity => entity.LoginProvider).HasMaxLength(FieldLimits.IdentityLoginProvider);
        modelBuilder.Entity<IdentityUserToken<long>>().Property(entity => entity.Name).HasMaxLength(FieldLimits.IdentityTokenName);
        modelBuilder.Entity<IdentityUserToken<long>>().Property(entity => entity.Value).HasMaxLength(FieldLimits.IdentityTokenValue);
        AddTextCheck<IdentityUserToken<long>>(modelBuilder, nameof(IdentityUserToken<long>.Value), FieldLimits.IdentityTokenValue, sqlServer);
        modelBuilder.Entity<IdentityUserClaim<long>>().Property(entity => entity.ClaimType).HasMaxLength(FieldLimits.IdentityClaimType);
        modelBuilder.Entity<IdentityUserClaim<long>>().Property(entity => entity.ClaimValue).HasMaxLength(FieldLimits.IdentityClaimValue);
        modelBuilder.Entity<IdentityRoleClaim<long>>().Property(entity => entity.ClaimType).HasMaxLength(FieldLimits.IdentityClaimType);
        modelBuilder.Entity<IdentityRoleClaim<long>>().Property(entity => entity.ClaimValue).HasMaxLength(FieldLimits.IdentityClaimValue);
        modelBuilder.Entity<UserFile>()
            .ToTable(table => table.HasCheckConstraint(
                "CK_UserFile_Size",
                $"[{nameof(UserFile.Size)}] >= 0"));
        modelBuilder.Entity<ApprovalRequest>()
            .ToTable(table => table.HasCheckConstraint(
                "CK_ApprovalRequest_Revision",
                $"[{nameof(ApprovalRequest.RevisionNumber)}] >= 1"));
        modelBuilder.Entity<ApprovalRequestTask>()
            .ToTable(table => table.HasCheckConstraint(
                "CK_ApprovalRequestTask_Revision",
                $"[{nameof(ApprovalRequestTask.RevisionNumber)}] >= 1"));
        modelBuilder.Entity<ApprovalRequestFile>()
            .ToTable(table => table.HasCheckConstraint(
                "CK_ApprovalRequestFile_Sequence",
                $"[{nameof(ApprovalRequestFile.Sequence)}] >= 0"));
        modelBuilder.Entity<ApprovalRequestStep>()
            .ToTable(table => table.HasCheckConstraint(
                "CK_ApprovalRequestStep_Sequence",
                $"[{nameof(ApprovalRequestStep.Sequence)}] >= 0"));
        modelBuilder.Entity<Tenant>()
            .ToTable(table => table.HasCheckConstraint(
                "CK_Tenant_Retention",
                $"[{nameof(Tenant.ApprovalRequestRetentionMonths)}] BETWEEN {RetentionLimits.NeverDeleteMonths} AND {RetentionLimits.MaximumMonths}"
                + $" AND [{nameof(Tenant.InAppNotificationRetentionMonths)}] BETWEEN {RetentionLimits.NeverDeleteMonths} AND {RetentionLimits.MaximumMonths}"));
        modelBuilder.Entity<AppUser>()
            .ToTable(table => table.HasCheckConstraint(
                "CK_AppUser_Counters",
                $"[{nameof(AppUser.AccessFailedCount)}] >= 0 AND [{nameof(AppUser.AccountEmailRateLimitRequestCount)}] >= 0"));
    }

    private static void AddTextCheck<TEntity>(ModelBuilder modelBuilder, string property, int limit, bool sqlServer)
        where TEntity : class
    {
        // DATALENGTH includes trailing spaces and counts UTF-16 code units like .NET string.Length.
        var expression = sqlServer
            ? $"DATALENGTH([{property}]) <= {limit * sizeof(char)}"
            : $"length([{property}]) <= {limit}";
        modelBuilder.Entity<TEntity>().ToTable(table =>
            table.HasCheckConstraint($"CK_{typeof(TEntity).Name.Split('`')[0]}_{property}_Length", expression));
    }
}
