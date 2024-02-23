export interface IAuthResponse {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
}

export class AuthResponse implements IAuthResponse {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
  refreshToken: string;

  constructor(
    tokenType: string = "",
    accessToken: string = "",
    expiresIn: number = 0,
    refreshToken: string = ""
  ) {
    this.tokenType = tokenType;
    this.accessToken = accessToken;
    this.expiresIn = expiresIn;
    this.refreshToken = refreshToken;
  }
}
