import { ApprovalRequestTaskClientAuditContext } from "@/features/approvalRequests/models/approvalRequestTaskClientAuditContext";

interface BrowserNetworkInformation {
  readonly downlink?: number;
  readonly effectiveType?: string;
  readonly rtt?: number;
  readonly saveData?: boolean;
}

interface BrowserUserAgentData {
  readonly mobile?: boolean;
  readonly platform?: string;
}

type BrowserNavigator = Navigator & {
  readonly connection?: BrowserNetworkInformation;
  readonly userAgentData?: BrowserUserAgentData;
};

export const createApprovalRequestTaskClientAuditContext =
  (): ApprovalRequestTaskClientAuditContext => {
    const browserNavigator = window.navigator as BrowserNavigator;
    const resolvedDateTimeOptions = Intl.DateTimeFormat().resolvedOptions();
    const connection = browserNavigator.connection;
    const userAgentData = browserNavigator.userAgentData;

    return {
      language: browserNavigator.language,
      languages: [...browserNavigator.languages],
      timeZone: resolvedDateTimeOptions.timeZone,
      timestamp: new Date().toISOString(),
      timeZoneOffsetMinutes: new Date().getTimezoneOffset(),
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      colorDepth: window.screen.colorDepth,
      touchSupported:
        window.matchMedia("(pointer: coarse)").matches ||
        browserNavigator.maxTouchPoints > 0,
      platform: browserNavigator.platform,
      userAgentPlatform: userAgentData?.platform,
      userAgentMobile: userAgentData?.mobile,
      connectionEffectiveType: connection?.effectiveType,
      connectionDownlink: connection?.downlink,
      connectionRoundTripTime: connection?.rtt,
      connectionSaveData: connection?.saveData,
      route: `${window.location.pathname}${window.location.search}`,
      buildVersion: import.meta.env.VITE_APP_VERSION,
    };
  };
