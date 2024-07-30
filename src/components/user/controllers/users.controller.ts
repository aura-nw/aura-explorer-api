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
  HttpCode,
  NotFoundException,
  BadRequestException,
  UsePipes,
  ValidationPipe,
  Req,
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
} from '@nestjs/swagger';
import { UserService } from '../user.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { JwtAuthGuard } from '../../../auth/jwt/jwt-auth.guard';
import {
  BaseApiResponse,
  MESSAGES,
  ReqContext,
  RequestContext,
  USER_ROLE,
} from '../../../shared';
import { RoleGuard } from '../../../auth/role/roles.guard';
import { Roles } from '../../../auth/role/roles.decorator';
import { User } from '../../../../src/shared/entities/user.entity';
import { UserDto } from '../dtos/user.dto';
import { CreateUserWithPasswordDto } from '../../../auth/password/dtos/create-user-with-password.dto';
import { ChangePasswordDto } from '../dtos/change-password.dto';
import { NotificationTokenDto } from '../dtos/notification-token.dto';
import { NotificationToken } from '../../../shared/entities/notification-token.entity';
import { DeleteResult } from 'typeorm';
import { AddUserAuthorityDto } from 'src/components/user-authority/dto/create-user-authority.dto';
import { UpdateUserAuthorityDto } from 'src/components/user-authority/dto/update-user-authority.dto';
import { UserAuthorityDto } from 'src/components/user-authority/dto/user-authority.dto';
import { LoginDto, LoginResponseDto } from '../dtos/login.dto';

@ApiTags('users')
@Controller('users')
@UsePipes(new ValidationPipe({ whitelist: true }))
@ApiUnauthorizedResponse({
  description: MESSAGES.ERROR.NOT_PERMISSION,
})
@ApiForbiddenResponse({
  description: MESSAGES.ERROR.NOT_PERMISSION,
})
@ApiBadRequestResponse({
  description: MESSAGES.ERROR.BAD_REQUEST,
})
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Login user.' })
  @ApiCreatedResponse({
    description: 'Login user.',
    type: LoginResponseDto,
  })
  @ApiBadRequestResponse({
    description: MESSAGES.ERROR.BAD_REQUEST,
  })
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return await this.userService.login(loginDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Return all users.' })
  @ApiOkResponse({
    description: 'Return all users.',
    type: UserDto,
    isArray: true,
  })
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<BaseApiResponse<User[]>> {
    const allUsers = await this.userService.findAll();

    return { data: allUsers, meta: {} };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Return user detail.' })
  @ApiOkResponse({
    description: 'Return user detail.',
    type: UserDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
  })
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<BaseApiResponse<User>> {
    const user = await this.userService.findOneById(+id || 0);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { data: user, meta: {} };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create user.' })
  @ApiCreatedResponse({
    description: 'User created.',
  })
  @ApiBadRequestResponse({
    description: 'Can not create user.',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<void> {
    try {
      await this.userService.create(createUserDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update user.' })
  @ApiOkResponse({ description: 'User updated.' })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    updateUserDto.id = +id || 0;

    try {
      return await this.userService.update(updateUserDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete user.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'User deleted.' })
  async remove(@Param('id') id: string): Promise<void> {
    try {
      await this.userService.delete(+id || 0);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('register-with-password')
  @HttpCode(HttpStatus.OK)
  async registerWithPassword(@Body() request: CreateUserWithPasswordDto) {
    await this.userService.createUserWithPassword(request);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN, USER_ROLE.USER)
  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  async changePassword(@Req() req, @Body() body: ChangePasswordDto) {
    await this.userService.changePassword(req.user.id, body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN, USER_ROLE.USER)
  @HttpCode(HttpStatus.OK)
  @Post('register-notification-token')
  async registerNotificationToken(
    @ReqContext() ctx: RequestContext,
    @Req() req,
    @Body() body: NotificationTokenDto,
  ): Promise<NotificationToken> {
    return await this.userService.registerNotificationToken(
      ctx,
      req.user.id,
      body,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN, USER_ROLE.USER)
  @HttpCode(HttpStatus.OK)
  @Delete('delete-notification-token/:token')
  async deleteNotificationToken(
    @Req() req,
    @Param('token') token: string,
  ): Promise<DeleteResult> {
    return await this.userService.deleteNotificationToken(req.user.id, token);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN)
  @Get('admin/user-authority')
  @ApiOperation({ summary: 'Return user authority.' })
  @ApiOkResponse({
    description: 'Return users authority.',
    type: UserAuthorityDto,
    isArray: true,
  })
  @ApiNotFoundResponse({
    description: 'User authority not found.',
  })
  async getUserAuthority(@Req() req, @ReqContext() _ctx: RequestContext) {
    console.log(`getUserAuthority userId: ${req.user.id}`);
    return await this.userService.getUserAuthority(req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN)
  @Post('admin/add-user-authority')
  @ApiOperation({ summary: 'Add new user authority.' })
  @ApiOkResponse({
    description: 'Add new user authority.',
    type: AddUserAuthorityDto,
  })
  async addUserAuthority(@Body() body: AddUserAuthorityDto) {
    return await this.userService.addUserAuthority(body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN)
  @Patch('admin/update-user-authority/:id')
  @ApiOperation({ summary: 'Update user authority.' })
  @ApiOkResponse({
    description: 'Update user authority.',
    type: UpdateUserAuthorityDto,
  })
  async updateUserAuthority(
    @Param('id') id: string,
    @ReqContext() _ctx: RequestContext,
    @Body() updateUserAuthorityDto: UpdateUserAuthorityDto,
  ) {
    return await this.userService.updateUserAuthority(
      +id,
      updateUserAuthorityDto,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN)
  @Delete('delete-user-authority/:id')
  @ApiOperation({ summary: 'Delete user authority.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeUserAuthority(
    @Param('id') id: string,
    @ReqContext() _ctx: RequestContext,
  ) {
    return await this.userService.removeUserAuthority(+id);
  }
}
