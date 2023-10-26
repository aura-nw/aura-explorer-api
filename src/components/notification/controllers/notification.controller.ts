import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  AkcLogger,
  BaseApiResponse,
  MESSAGES,
  ReqContext,
  RequestContext,
  USER_ROLE,
} from '../../../shared';
import { NotificationService } from '../services/notification.service';
import { Roles } from '../../../auth/role/roles.decorator';
import { JwtAuthGuard } from '../../../auth/jwt/jwt-auth.guard';
import { GetNotificationResult } from '../dtos/get-notification.dto';
import { RoleGuard } from '../../../auth/role/roles.guard';
import { Notification } from '../../../shared/entities/notification.entity';
import { NotificationParamsDto } from '../dtos/get-notification-param.dto';

@Controller()
@ApiTags('notification')
@ApiUnauthorizedResponse({
  description: MESSAGES.ERROR.NOT_PERMISSION,
})
@ApiForbiddenResponse({
  description: MESSAGES.ERROR.NOT_PERMISSION,
})
@ApiBadRequestResponse({
  description: MESSAGES.ERROR.BAD_REQUEST,
})
export class NotificationController {
  constructor(
    private readonly nameTagService: NotificationService,
    private readonly logger: AkcLogger,
  ) {
    this.logger.setContext(NotificationController.name);
  }

  @Get('notification/:userId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN, USER_ROLE.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list private name tag' })
  @ApiResponse({ status: HttpStatus.OK })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: GetNotificationResult })
  async getNotifications(
    @ReqContext() ctx: RequestContext,
    @Query() param: NotificationParamsDto,
  ): Promise<BaseApiResponse<Notification[]>> {
    this.logger.log(ctx, `${this.getNotifications.name} was called!`);
    const { result, count } = await this.nameTagService.getNotifications(
      ctx,
      param,
    );
    return { data: result, meta: { count } };
  }

  @Get('notification/:userId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(USER_ROLE.ADMIN, USER_ROLE.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list private name tag' })
  @ApiResponse({ status: HttpStatus.OK })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: GetNotificationResult })
  async countNotification(
    @ReqContext() ctx: RequestContext,
    @Query() param: NotificationParamsDto,
  ): Promise<BaseApiResponse<Notification[]>> {
    this.logger.log(ctx, `${this.getNotifications.name} was called!`);
    const data = await this.nameTagService.getNotifications(ctx, userId);
    return { data, meta: { count: data?.length } };
  }
}
