using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Validation.ApprovalRequests;

/// <summary>Contains the authorized task and proposed completion.</summary>
public sealed record TaskCompletionContext(ApprovalRequestTask Task, CompleteApprovalRequestTaskCommand Command);
