import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  EntityNotFoundError,
  FindOneOptions,
  Repository,
} from 'typeorm';

import { User } from '../../shared/entities/user.entity';
import {
  MESSAGES,
  MSGS_ACTIVE_USER,
  MSGS_USER,
  PROVIDER,
  QUEUES,
  SITE,
  SUPPORT_EMAIL,
  USER_ACTIVITIES,
  USER_ROLE,
} from '../../shared';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserRepository } from './repositories/user.repository';
import { UpdateUserDto } from './dtos/update-user.dto';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { CreateUserWithPasswordDto } from '../../auth/password/dtos/create-user-with-password.dto';
import { UserActivity } from '../../shared/entities/user-activity.entity';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ResetPasswordDto } from '../../auth/password/dtos/reset-password.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { secondsToDate } from '../../shared/utils/service.util';
const VERIFICATION_TOKEN_LENGTH = 20;
const RESET_PASSWORD_TOKEN_LENGTH = 21;
const RANDOM_BYTES_LENGTH = 20;
@Injectable()
export class UserService {
  private logger: Logger = new Logger(UserService.name);
  constructor(
    @InjectQueue(QUEUES.SEND_MAIL.QUEUE_NAME)
    private readonly sendMailQueue: Queue,
    @InjectRepository(User)
    private usersRepository: UserRepository,
    @InjectRepository(UserActivity)
    private userActivityRepository: Repository<UserActivity>,
    private configService: ConfigService,
  ) {}

  async findOne(params: FindOneOptions<User> = {}): Promise<User> {
    return await this.usersRepository.findOne(params);
  }

  async findOneById(id: number): Promise<User> {
    return await this.usersRepository.findOne({ id });
  }

  async findOneByEmail(email: string): Promise<User> {
    return await this.usersRepository.findOne({ email });
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async create(user: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user: ${JSON.stringify(user)}`);
    return await this.usersRepository.save(user);
  }

  async update(user: UpdateUserDto): Promise<User> {
    this.logger.log(`Updating user: ${JSON.stringify(user)}`);
    const foundUser = await this.findOne({ where: { id: user.id } });

    if (foundUser) {
      await this.usersRepository.merge(foundUser, user);
      return await this.usersRepository.save(foundUser);
    } else {
      throw new NotFoundException('User not found');
    }
  }

  async delete(id: number): Promise<void> {
    const foundUser = await this.findOne({ where: { id: id } });

    if (foundUser) {
      await this.usersRepository.delete(id);
    } else {
      throw new NotFoundException('User not found');
    }
  }

  async save(user: User): Promise<void> {
    await this.usersRepository.save(user);
  }

  checkRole(user: DeepPartial<User>, site = SITE.MAIN): void {
    if (!user) {
      throw new UnauthorizedException(MESSAGES.ERROR.NOT_PERMISSION);
    }

    if (user.role === USER_ROLE.BANNED) {
      throw new UnauthorizedException(MESSAGES.ERROR.BANNED);
    }

    if (site === SITE.ADMIN && user.role === USER_ROLE.USER) {
      throw new UnauthorizedException(MESSAGES.ERROR.NOT_PERMISSION);
    }
  }

  async createUserWithPassword(
    userParams: CreateUserWithPasswordDto,
  ): Promise<void> {
    const newUser = new User();
    newUser.encryptedPassword = await this.hashPassword(userParams.password);
    newUser.email = userParams.email;
    newUser.provider = PROVIDER.PASSWORD;
    newUser.role = USER_ROLE.USER;
    newUser.verificationToken = await this.generateTokenWithLength(
      VERIFICATION_TOKEN_LENGTH,
    );

    const newUserActivity = new UserActivity();
    newUserActivity.type = USER_ACTIVITIES.SEND_MAIL_VERIFY;
    newUserActivity.sendMailAttempt = 1;
    newUserActivity.lastSendMailAttempt = new Date();

    newUser.userActivities = [newUserActivity];

    try {
      await this.usersRepository.manager.transaction(
        async (transactionalEntityManager) => {
          await transactionalEntityManager.save(newUser);
          await this.sendMailQueue.add(
            QUEUES.SEND_MAIL.JOB,
            {
              user: newUser,
              mailType: USER_ACTIVITIES.SEND_MAIL_VERIFY,
            },
            {
              removeOnComplete: false,
              removeOnFail: false,
            },
          );
        },
      );
    } catch (error) {
      this.logger.error(
        `Error while create new user with password: ${error.message} ${error.stack}`,
      );
      throw new BadRequestException(
        'We have some errors when register your account. Please try again later.',
      );
    }
  }

  async activeUser(
    email: string,
    token: string,
  ): Promise<{ message: string; code: string }> {
    const userToActive = await this.findOne({
      where: { email: email, verificationToken: token },
    });

    if (!userToActive) {
      return MSGS_ACTIVE_USER.EA002;
    }

    if (userToActive.verifiedAt) {
      return MSGS_ACTIVE_USER.EA001;
    }

    if (userToActive.verificationToken === token) {
      userToActive.verifiedAt = new Date();
      await this.usersRepository.save(userToActive);

      return MSGS_ACTIVE_USER.SA001;
    } else {
      return MSGS_ACTIVE_USER.EA003;
    }
  }

  async resendVerificationEmail(user: User): Promise<void> {
    if (!user) {
      throw new BadRequestException('User have not registered.');
    }

    if (user.verifiedAt) {
      throw new BadRequestException('User already verified.');
    }

    if (user.provider != PROVIDER.PASSWORD) {
      throw new BadRequestException('User have not registered with password.');
    }

    try {
      const sendMailConfirmActivity = await this.userActivityRepository.findOne(
        {
          where: { user: user, type: USER_ACTIVITIES.SEND_MAIL_VERIFY },
        },
      );
      const VERIFICATION_TEXT = 'verification';

      this.limitSendMail(sendMailConfirmActivity, VERIFICATION_TEXT);

      await this.sendMailQueue.add(
        QUEUES.SEND_MAIL.JOB,
        {
          user: user,
          mailType: USER_ACTIVITIES.SEND_MAIL_VERIFY,
        },
        {
          removeOnComplete: false,
          removeOnFail: false,
        },
      );

      await this.userActivityRepository.save(sendMailConfirmActivity);
    } catch (error) {
      this.logger.error(`Error resend email ${error.message} ${error.stack}`);
      throw new BadRequestException(error.message);
    }
  }

  limitSendMail(userActivity: UserActivity, type: string): void {
    //Check limit sent mail: 5 times per day, 5 minutes between each time.
    const FIVE_TIMES = 5;
    const lastSentMail = userActivity.lastSendMailAttempt;
    const currentTime = new Date();
    const fiveMinutesAgo = new Date(currentTime.getTime() - 5 * 60000);

    this.increaseSendMailAttempt(userActivity);

    if (lastSentMail > fiveMinutesAgo) {
      throw new BadRequestException(
        `Only can do resend email after 5 minute, please wait and click Resend again.`,
      );
    }

    if (userActivity.sendMailAttempt > FIVE_TIMES) {
      throw new BadRequestException(
        `You have reached the maximum number of ${type} email sent per day. Kindly come back tomorrow or contact us via mailbox [${SUPPORT_EMAIL}] for special case!`,
      );
    }
  }

  increaseSendMailAttempt(userActivity: UserActivity): void {
    // Check if last lastSendMailAttempt < 00:00 then init to 1;
    // Check if last lastSendMailAttempt > 00:00 then increase 1;
    const FIRST_TIME = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const midnightTimestamp = today.getTime();
    const lastSendMailAttempt = new Date(userActivity.lastSendMailAttempt);

    if (lastSendMailAttempt.getTime() < midnightTimestamp) {
      userActivity.sendMailAttempt = FIRST_TIME;
    } else {
      userActivity.sendMailAttempt++;
    }

    userActivity.lastSendMailAttempt = new Date();
  }

  async sendResetPasswordEmail(user: User): Promise<void> {
    if (!user) {
      throw new BadRequestException('User have not registered.');
    }

    if (!user.verifiedAt) {
      throw new BadRequestException(MSGS_USER.EU001);
    }

    user.resetPasswordToken = await this.generateTokenWithLength(
      RESET_PASSWORD_TOKEN_LENGTH,
    );

    const resetPasswordActivity = await this.findOrCreateUserActivity(
      user,
      USER_ACTIVITIES.SEND_MAIL_RESET_PASSWORD,
    );
    const RESET_PASSWORD_TEXT = 'password recovery';

    this.limitSendMail(resetPasswordActivity, RESET_PASSWORD_TEXT);

    await this.sendMailQueue.add(
      QUEUES.SEND_MAIL.JOB,
      {
        user: user,
        mailType: USER_ACTIVITIES.SEND_MAIL_RESET_PASSWORD,
      },
      {
        removeOnComplete: false,
        removeOnFail: false,
      },
    );

    await this.usersRepository.save(user);

    await this.userActivityRepository.save(resetPasswordActivity);
  }

  async findOrCreateUserActivity(
    user: User,
    type: USER_ACTIVITIES,
  ): Promise<UserActivity> {
    let userActivity: UserActivity;
    try {
      userActivity = await this.userActivityRepository.findOneOrFail({
        where: { user, type },
      });
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        userActivity = new UserActivity();
        userActivity.type = type;
        userActivity.sendMailAttempt = 0;
        //Set lastSendMailAttempt to valid time.
        const currentDate = new Date();
        const sixMinutesAgo = new Date(currentDate.getTime() - 6 * 60000);
        userActivity.lastSendMailAttempt = sixMinutesAgo;
        userActivity.user = user;
        await this.userActivityRepository.save(userActivity);
      }
    }
    return userActivity;
  }
  async resetPassword(passwordParams: ResetPasswordDto) {
    const user = await this.usersRepository.findOne({
      where: {
        email: passwordParams.email,
      },
    });

    if (!user) {
      throw new BadRequestException(
        'User not registered with us before or the link reset password is invalid.',
      );
    }

    if (
      user.resetPasswordToken !== null &&
      user.resetPasswordToken !== passwordParams.resetPasswordToken
    ) {
      throw new BadRequestException('Invalid token');
    }

    // Check expired reset password link (available in 24h).
    if (user) {
      const lastSendResetPasswordAttempt =
        await this.userActivityRepository.findOne({
          where: { user: user, type: USER_ACTIVITIES.SEND_MAIL_RESET_PASSWORD },
        });

      if (lastSendResetPasswordAttempt) {
        const lastSend = lastSendResetPasswordAttempt.lastSendMailAttempt;
        const millisecondOf24h = 24 * 60 * 60 * 1000;
        const after24hFromLastSend = new Date(
          lastSend.getTime() + millisecondOf24h,
        );
        const currentTime = new Date();

        if (currentTime > after24hFromLastSend) {
          throw new BadRequestException('Reset password link expired.');
        }
      }
    }

    // Set new password.
    user.encryptedPassword = await this.hashPassword(passwordParams.password);

    // Reset resetPasswordToken.
    user.resetPasswordToken = null;
    if (user.provider !== PROVIDER.PASSWORD) {
      user.provider = PROVIDER.PASSWORD;
    }

    // Set last required login.
    user.lastRequiredLogin = new Date();

    await this.usersRepository.save(user);
  }

  async generateTokenWithLength(length: number): Promise<string> {
    return randomBytes(RANDOM_BYTES_LENGTH)
      .toString('hex')
      .slice(0, length)
      .toUpperCase();
  }

  async changePassword(
    userId: number,
    passwordParams: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.findOneById(userId);
    // If user's provider is google and the first time change password then create new password.
    if (user.provider === PROVIDER.GOOGLE && user.encryptedPassword == null) {
      user.encryptedPassword = await this.hashPassword(passwordParams.password);
      user.provider = PROVIDER.PASSWORD;
    } else if (user.provider === PROVIDER.PASSWORD) {
      // Old password must be provided.
      if (!passwordParams.oldPassword) {
        throw new BadRequestException('Old password can not be empty.');
      }

      // Verify password before change.
      const isMatchOldPassword = await this.verifyPassword(
        passwordParams.oldPassword,
        user.encryptedPassword,
      );

      const isNewPasswordSameAsOld = await this.verifyPassword(
        passwordParams.password,
        user.encryptedPassword,
      );

      if (!isMatchOldPassword) {
        throw new UnauthorizedException('Incorrect old password.');
      } else if (isNewPasswordSameAsOld) {
        throw new BadRequestException(
          'New password must be different from current password.',
        );
      }

      user.encryptedPassword = await this.hashPassword(passwordParams.password);
    } else {
      throw new BadRequestException(MESSAGES.ERROR.SOME_THING_WRONG);
    }

    user.lastRequiredLogin = new Date();

    await this.usersRepository.save(user);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, Number(this.configService.get('bcryptSalt')));
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch {
      throw new BadRequestException(MESSAGES.ERROR.SOME_THING_WRONG);
    }
  }

  checkLastRequiredLogin(user: User, jwtIat: number): void {
    if (user.lastRequiredLogin > secondsToDate(jwtIat)) {
      throw new UnauthorizedException({
        code: MESSAGES.ERROR.NEED_TO_BE_LOGGED_IN_AGAIN.CODE,
        message: MESSAGES.ERROR.NEED_TO_BE_LOGGED_IN_AGAIN.MESSAGE,
      });
    }
  }
}
