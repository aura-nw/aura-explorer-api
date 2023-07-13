import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';
import { MatchPassword } from '../validators/validate-match-password';

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  oldPassword: string;

  @ApiProperty()
  @IsString()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'The password need to be more than 8 characters in length with at least one upper case, 1 lower case, 1 number and 1 special character.',
    },
  )
  password: string;

  @ApiProperty()
  @IsString()
  @MatchPassword('password', {
    message: 'The password confirmation does not match.',
  })
  passwordConfirmation: string;
}
