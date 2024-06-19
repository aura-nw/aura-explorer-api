import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  // UseGuards,
} from '@nestjs/common';
import { UserAuthorityService } from './user-authority.service';
import { CreateUserAuthorityDto } from './dto/create-user-authority.dto';
import { UpdateUserAuthorityDto } from './dto/update-user-authority.dto';
// import { ApiBearerAuth } from '@nestjs/swagger';
// import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
// import { RoleGuard } from '../../auth/role/roles.guard';
// import { USER_ROLE } from '../../shared';
// import { Roles } from '../../auth/role/roles.decorator';

@Controller('user-authority')
export class UserAuthorityController {
  constructor(private readonly userAuthorityService: UserAuthorityService) {}

  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard) // RoleGuard
  // @Roles(USER_ROLE.ADMIN)
  @Post()
  create(@Body() createUserAuthorityDto: CreateUserAuthorityDto) {
    return this.userAuthorityService.create(createUserAuthorityDto);
  }

  @Get()
  findAll() {
    return this.userAuthorityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userAuthorityService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserAuthorityDto: UpdateUserAuthorityDto,
  ) {
    return this.userAuthorityService.update(+id, updateUserAuthorityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userAuthorityService.remove(+id);
  }
}
