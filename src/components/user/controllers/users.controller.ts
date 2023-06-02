import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  UnprocessableEntityException,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { UserService } from '../user.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { MESSAGES, ReqContext, RequestContext, USER_ROLE } from 'src/shared';
import { RoleGuard } from 'src/auth/role/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(USER_ROLE.ADMIN)
@ApiUnauthorizedResponse({
  description: MESSAGES.ERROR.NOT_PERMISSION,
})
@ApiForbiddenResponse({
  description: MESSAGES.ERROR.NOT_PERMISSION,
})
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Return all users.' })
  @ApiOkResponse({
    description: 'Return all users.',
    type: UpdateUserDto,
    isArray: true,
  })
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const allUsers = await this.userService.findAll();

    return { data: allUsers, meta: {} };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Return user detail.' })
  @ApiOkResponse({
    description: 'Return user detail.',
    type: UpdateUserDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
  })
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne({ where: { id: +id || 0 } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { data: user, meta: {} };
  }

  @Post()
  @ApiOperation({ summary: 'Create user.' })
  @ApiCreatedResponse({
    description: 'User created.',
  })
  @ApiBadRequestResponse({
    description: 'Can not create user.',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      await this.userService.create(createUserDto);
    } catch (error) {
      throw new UnprocessableEntityException(error.message);
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user.' })
  @ApiOkResponse({ description: 'User updated.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @ApiUnprocessableEntityResponse({ description: 'Can not update user.' })
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    updateUserDto.id = +id || 0;

    try {
      await this.userService.update(updateUserDto);
    } catch (error) {
      throw new UnprocessableEntityException(error.message);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'User deleted.' })
  async remove(@Param('id') id: string) {
    try {
      await this.userService.delete(+id || 0);
    } catch (error) {
      throw new UnprocessableEntityException(error.message);
    }
  }
}
