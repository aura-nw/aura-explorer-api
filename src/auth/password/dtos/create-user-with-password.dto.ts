import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Matches } from 'class-validator';
import { MatchPassword } from '../../../components/user/validators/validate-match-password';
import { IsUnique } from '../../../components/user/validators/validate-unique';

export class CreateUserWithPasswordDto {
  @ApiProperty()
  @IsEmail()
  @IsUnique('email', {
    message: 'The email you entered has already been used.',
  })
  email: string;

  @ApiProperty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[`~!@#$%^&*()_+{}|/:;",.?<>`])[A-Za-z\d~!@#$%^&*()_+{}|/:;",.?<>]{8,}$/,
    {
      message:
        'The password need to be more than 8 characters in length with at least one upper case, 1 lower case, 1 number and 1 special character.',
    },
  )
  password: string;

  @ApiProperty()
  @MatchPassword('password', {
    message: 'The password confirmation does not match.',
  })
  passwordConfirmation: string;
}
