import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
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
import { NotificationParamsDto } from '../dtos/get-notification-param.dto';
import { UpdateResult } from 'typeorm';
import { UserActivity } from 'src/shared/entities/user-activity.entity';

@Controller()
@ApiTags('notification')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(USER_ROLE.ADMIN, USER_ROLE.USER)
@ApiBearerAuth()
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
    private readonly notificationService: NotificationService,
    private readonly logger: AkcLogger,
  ) {
    this.logger.setContext(NotificationController.name);
  }

  @Get('notification')
  @ApiOperation({ summary: 'Get list Notifications' })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: GetNotificationResult })
  async getNotifications(
    @ReqContext() ctx: RequestContext,
    @Query() param: NotificationParamsDto,
  ): Promise<BaseApiResponse<GetNotificationResult[]>> {
    this.logger.log(ctx, `${this.getNotifications.name} was called!`);
    const { result, count, countUnread } =
      await this.notificationService.getNotifications(ctx, param);
    return { data: result, meta: { count, countUnread } };
  }

  @Get('quota-notifications')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get daily quota notifications' })
  @ApiResponse({ status: HttpStatus.OK })
  async getDailyQuotaNotification(
    @ReqContext() ctx: RequestContext,
  ): Promise<UserActivity> {
    return await this.notificationService.getDailyQuotaNotification(ctx);
  }

  @Put('notification/read/:id')
  @ApiOperation({ summary: 'Update notifications' })
  @ApiResponse({ status: HttpStatus.OK })
  async readNotification(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: number,
  ): Promise<UpdateResult> {
    this.logger.log(ctx, `${this.readNotification.name} was called!`);
    return await this.notificationService.readNotification(ctx, id);
  }

  @Put('notification/read-all')
  @ApiOperation({ summary: 'Update all as read notifications' })
  @ApiResponse({ status: HttpStatus.OK })
  async readAllNotification(
    @ReqContext() ctx: RequestContext,
  ): Promise<UpdateResult> {
    this.logger.log(ctx, `${this.readAllNotification.name} was called!`);
    return await this.notificationService.readAllNotification(ctx);
  }
}
