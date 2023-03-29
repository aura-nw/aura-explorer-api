import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  @Get('/logout')
  @ApiOperation({ summary: 'Logout' })
  @ApiResponse({ status: HttpStatus.OK })
  async logout(@Res() res: Response) {
    res.cookie('jwt', '', {
      expires: new Date(1),
    });

    res.send('Logout Successes!');
  }
}
