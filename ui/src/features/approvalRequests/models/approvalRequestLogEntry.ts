export enum ApprovalLogActorType {
  System = 0,
  User = 1,
  Employee = 2,
}

export enum ApprovalRequestLogEventType {
  Submitted = 0,
  StatusChanged = 1,
}

export enum ApprovalRequestTaskLogEventType {
  Submitted = 0,
  StatusChanged = 1,
}

export interface ApprovalLogEntryBase {
  id: number;
  timestamp: string;
  timestampDate: Date;
  actorType: ApprovalLogActorType;
  actorUserId?: string;
  actorEmployeeId?: number;
  actorEmail: string;
  actorDisplayName?: string;
  details: string;
}

export interface ApprovalRequestLogEntry extends ApprovalLogEntryBase {
  eventType: ApprovalRequestLogEventType;
}

export interface ApprovalRequestTaskLogEntry extends ApprovalLogEntryBase {
  approvalRequestTaskId: number;
  eventType: ApprovalRequestTaskLogEventType;
  onBehalfOfActorType?: ApprovalLogActorType;
  onBehalfOfUserId?: string;
  onBehalfOfEmployeeId?: number;
  onBehalfOfEmail?: string;
  onBehalfOfDisplayName?: string;
}
