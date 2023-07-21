import { Injectable } from '@nestjs/common';
// import * as redis from "redis";
import * as appConfig from '../../shared/configs/configuration';
const redis = require('redis');
import Redis from 'ioredis';

@Injectable()
export class RedisUtil {
  private redisClient;
  private ioRedis;
  private appConfig;

  constructor() {
    this.appConfig = appConfig.default();
    const redisConfig = this.appConfig.cacheManagement.redis;
    const redisURL = {
      url: `redis://${redisConfig.username}:${redisConfig.password}@${redisConfig.host}:${redisConfig.port}/${redisConfig.db}`,
    };
    this.redisClient = redis.createClient(redisURL);
    this.ioRedis = new Redis({
      port: parseInt(redisConfig.port, 10),
      host: redisConfig.host,
      username: redisConfig.username,
      password: redisConfig.password,
      db: parseInt(redisConfig.db_socket, 10),
    });
  }

  public convertDateToString() {
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

  public async getAllBullQueueName(): Promise<string[]> {
    const BULL_REGEX = `${this.appConfig.indexer.chainId}:*:id`;

    try {
      await this.redisClient.connect();
      const bullRedisKeys: string[] = await this.redisClient.keys(BULL_REGEX);
      return bullRedisKeys.map((redisKey) => redisKey.split(':')[1]);
    } catch (error) {
      console.log(`Error while connecting to redis. ${error}`);
      return [];
    } finally {
      await this.redisClient.disconnect();
    }
  }
}
