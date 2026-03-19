export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  id_token?: string;
  scope?: string;
}

export interface UserInfo {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
}

export interface AuthState {
  state: string;
  codeVerifier?: string;
  redirectUrl?: string;
}
