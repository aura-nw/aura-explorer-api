import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';
import { MatchPassword } from '../../../components/user/validators/validate-match-password';

export class ResetPasswordDto {
  @ApiProperty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character',
    },
  )
  password: string;

  @ApiProperty()
  @MatchPassword('password', {
    message: 'Password confirmation must match the password.',
  })
  passwordConfirmation: string;
}
