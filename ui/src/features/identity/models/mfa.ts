export interface MfaRequired {
  requiresTwoFactor: true;
}

export interface TwoFactorCredentials {
  twoFactorCode?: string;
  twoFactorRecoveryCode?: string;
}

export interface MfaStatus {
  enabled: boolean;
  isAvailable: boolean;
}

export interface TwoFactorResponse {
  sharedKey: string;
  recoveryCodes: string[] | null;
  recoveryCodesLeft: number;
  isTwoFactorEnabled: boolean;
  isMachineRemembered: boolean;
}

export interface TwoFactorRequest {
  enable?: boolean;
  twoFactorCode?: string;
  resetSharedKey?: boolean;
  resetRecoveryCodes?: boolean;
  forgetMachine?: boolean;
}
