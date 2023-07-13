import { IsEmail, IsIn, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PROVIDER, USER_ROLE } from '../../../shared';
const providers = Object.values(PROVIDER);
const roles = Object.values(USER_ROLE);
export class CreateUserDto {
  @ApiProperty({ description: 'User email', example: 'example@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User name' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: `Provider: ${providers}`,
    enum: PROVIDER,
    example: PROVIDER.GOOGLE,
    default: PROVIDER.GOOGLE,
  })
  @IsIn(providers)
  provider: PROVIDER;

  @ApiProperty({
    description: `Role: ${roles}`,
    enum: USER_ROLE,
    example: USER_ROLE.USER,
    default: USER_ROLE.USER,
  })
  @IsIn(roles)
  role: USER_ROLE;

  @ApiPropertyOptional({
    description: 'Default null if user not verified',
    default: null,
  })
  verifiedAt: Date;
}
