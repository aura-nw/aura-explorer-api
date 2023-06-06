import { PROVIDER, USER_ROLE } from 'src/shared';

export class CreateUserDto {
  email: string;
  name: string;
  provider: PROVIDER;
  role: USER_ROLE;
}
