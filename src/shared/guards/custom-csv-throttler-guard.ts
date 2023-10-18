import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CustomCsvThrottlerGuard extends ThrottlerGuard {
  protected errorMessage =
    'You have reached the limit for the number of consecutive data exports, please try again after ' +
    Math.floor(Number(process.env.LIMITER_CSV_TTL || 300000) / 60000) +
    ' minutes.';

  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.ips.length ? req.ips[0] : req.ip;
  }
}
