import { UserAccessTokenClaims } from '../auth/auth-token-output.dto';

export class RequestContext {
  public requestId: string;

  public url: string;

  public ip: string;

  public user: UserAccessTokenClaims;
}
