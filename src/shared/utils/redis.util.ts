import { Injectable } from '@nestjs/common';
// import * as redis from "redis";
import * as appConfig from '../../shared/configs/configuration';
const redis = require('redis');
import Redis from 'ioredis';

@Injectable()
export class RedisUtil {
  private redisClient;
  private ioRedis;

  constructor() {
    const appParams = appConfig.default();
    const redisURL = {
      url: `redis://${appParams.cacheManagement.redis.username}:${appParams.cacheManagement.redis.password}@${appParams.cacheManagement.redis.host}:${appParams.cacheManagement.redis.port}`,
    };
    this.redisClient = redis.createClient(redisURL);
    this.ioRedis = new Redis({
      port: parseInt(appParams.cacheManagement.redis.port, 10),
      host: appParams.cacheManagement.redis.host,
      username: appParams.cacheManagement.redis.username,
      password: appParams.cacheManagement.redis.password,
      db: parseInt(appParams.cacheManagement.redis.db, 10),
    });
  }

  public convertDateToString(date: Date) {
    const timestamp = new Date();
    timestamp.setSeconds(0, 0);
    return timestamp.toISOString();
  }

  public async connect() {
    try {
      if (!this.redisClient.isOpen) {
        await this.redisClient.connect();
      }
      console.log('Auth complete...');
    } catch (err) {
      console.log(err);
    }
  }

  public async setValue(key: string, data: any) {
    await this.redisClient.set(key, JSON.stringify(data));
  }

  public async getValue(key: string) {
    return this.redisClient.get(key);
  }

  public getIoRedis() {
    return this.ioRedis;
  }
}
