import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches } from 'class-validator';
import { MatchPassword } from '../../../components/user/validators/validate-match-password';
import { REGEX_PARTERN } from '../../../shared';

export class ResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  resetPasswordToken: string;

  @Matches(REGEX_PARTERN.PASSWORD, {
    message:
      'The password need to be more than 8 characters in length with at least one upper case, 1 lower case, 1 number and 1 special character.',
  })
  password: string;

  @ApiProperty()
  @MatchPassword('password', {
    message: 'The password confirmation does not match.',
  })
  passwordConfirmation: string;
}
