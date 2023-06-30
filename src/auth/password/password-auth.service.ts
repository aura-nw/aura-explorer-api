import { Injectable } from '@nestjs/common';
import { UserService } from 'src/components/user/user.service';

@Injectable()
export class PasswordAuthService {
  constructor(private userService: UserService) {}
}
