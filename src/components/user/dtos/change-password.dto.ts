import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';
import { MatchPassword } from '../validators/validate-match-password';
import { REGEX_PARTERN } from '../../../shared';

export class ChangePasswordDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  oldPassword: string;

  @ApiProperty()
  @IsString()
  @Matches(REGEX_PARTERN.PASSWORD, {
    message:
      'The password need to be more than 8 characters in length with at least one upper case, 1 lower case, 1 number and 1 special character.',
  })
  password: string;

  @ApiProperty()
  @IsString()
  @MatchPassword('password', {
    message: 'The password confirmation does not match.',
  })
  passwordConfirmation: string;
}
