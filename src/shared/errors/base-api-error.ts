import { HttpException } from '@nestjs/common';

export class BaseApiError extends HttpException {
  public localizedMessage: Record<string, string>;
  public details: string | Record<string, any>;

  constructor(
    message: string,
    status: number,
    details?: string | Record<string, any>,
    localizedMessage?: Record<string, string>,
  ) {
    super(message, status);
    this.name = BaseApiError.name;
    this.localizedMessage = localizedMessage;
    this.details = details;
  }
}
