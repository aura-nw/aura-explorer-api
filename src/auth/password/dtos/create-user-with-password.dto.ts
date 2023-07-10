import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsEmail, Matches, MaxLength, MinLength } from 'class-validator';
import { MatchPassword } from '../../../components/user/validators/validate-match-password';
import { IsUnique } from '../../../components/user/validators/validate-unique';
import { USER_ROLE } from '../../../shared';

export class CreateUserWithPasswordDto {
  @ApiProperty()
  @MinLength(5, { message: 'User name must be at least 5 characters' })
  @MaxLength(30, { message: 'User name must be at most 30 characters' })
  @IsUnique('userName', { message: 'The username is already in use.' })
  userName: string;

  @ApiProperty()
  @IsEmail()
  @IsUnique('email', { message: 'The email is already in use.' })
  email: string;

  @ApiProperty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'The password need to be more than 8 characters in length with at least one upper case, 1 lower case, 1 number and 1 special character.',
    },
  )
  password: string;

  @ApiProperty()
  @MatchPassword('password', {
    message: 'Password confirmation must match the password.',
  })
  passwordConfirmation: string;

  @Exclude()
  role: USER_ROLE;
}
