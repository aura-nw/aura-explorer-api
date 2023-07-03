import { Injectable } from '@nestjs/common';
import { UserService } from '../../components/user/user.service';

@Injectable()
export class PasswordAuthService {
  constructor(private userService: UserService) {}
}
