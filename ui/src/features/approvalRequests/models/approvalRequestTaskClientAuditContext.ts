export interface ApprovalRequestTaskClientAuditContext {
  language?: string;
  languages?: string[];
  timeZone?: string;
  timestamp?: string;
  timeZoneOffsetMinutes?: number;
  screenWidth?: number;
  screenHeight?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  devicePixelRatio?: number;
  colorDepth?: number;
  touchSupported?: boolean;
  platform?: string;
  userAgentPlatform?: string;
  userAgentMobile?: boolean;
  connectionEffectiveType?: string;
  connectionDownlink?: number;
  connectionRoundTripTime?: number;
  connectionSaveData?: boolean;
  route?: string;
  buildVersion?: string;
}
