export interface UserClaim {
  typ: string;
  val: string;
}

export interface AccessResponse {
  access_token: string;
  expires_on: Date;
  provider_name: string;
  user_claims: UserClaim[];
  user_id: string;
}
