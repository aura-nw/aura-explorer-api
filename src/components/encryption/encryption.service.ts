import { Injectable, OnModuleInit } from '@nestjs/common';
import * as appConfig from '../../shared/configs/configuration';
import { KMS } from 'aws-sdk';
import { InjectRepository } from '@nestjs/typeorm';
import { CipherKey } from '../../shared/entities/cipher-key.entity';
import { Repository } from 'typeorm';
import { PlaintextType } from 'aws-sdk/clients/kms';

@Injectable()
export class EncryptionService implements OnModuleInit {
  private config;
  private kms: KMS;
  private key: PlaintextType;

  constructor(
    @InjectRepository(CipherKey)
    private readonly cipherKeyRepository: Repository<CipherKey>,
  ) {
    this.config = appConfig.default();

    this.kms = new KMS({
      accessKeyId: this.config.kms.accessKeyId,
      secretAccessKey: this.config.kms.secretAccessKey,
      region: this.config.kms.region,
      apiVersion: this.config.kms.apiVersion,
    });
  }

  async onModuleInit() {
    this.key = await this.getKey();
  }

  public async addCipherKey() {
    const KeyId = this.config.kms.alias;
    const KeySpec = 'AES_256';
    const key = await this.cipherKeyRepository.findOne();
    if (key) {
      return;
    }
    const { CiphertextBlob } = await this.kms
      .generateDataKey({ KeyId, KeySpec })
      .promise();

    const cipherKey = new CipherKey();
    cipherKey.cipher_text = CiphertextBlob.toString('hex');
    await this.cipherKeyRepository.save(cipherKey);
  }

  public async getKey(): Promise<PlaintextType> {
    let cipherKey = await this.cipherKeyRepository.findOne();

    if (!cipherKey) {
      await this.addCipherKey();
      cipherKey = await this.cipherKeyRepository.findOne();
    }

    const CiphertextBlob = Buffer.from(cipherKey.cipher_text, 'hex');
    const key = await this.kms.decrypt({ CiphertextBlob }).promise();
    return key.Plaintext;
  }

  public async encrypt(buffer: string): Promise<string> {
    const data = await this.encryptAES(this.key, buffer);
    return data.toString('hex');
  }

  public async decrypt(buffer: string): Promise<string> {
    const data = await this.decryptAES(this.key, Buffer.from(buffer, 'hex'));
    return data.toString();
  }

  /**
   * Encrypt the data using AES-256
   * @param key
   * @param buffer
   * @returns {void|*|Promise<any>}
   */
  async encryptAES(key, buffer) {
    // Asynchronous
    const { createCipheriv } = await import('crypto');

    const iv = Buffer.from('00000000000000000000000000000000', 'hex');
    const encryptor = createCipheriv('aes-256-cbc', key, iv);
    encryptor.write(buffer);
    encryptor.end();

    return encryptor.read();
  }

  /**
   * Decrypt the data using AES-256
   * @param key
   * @param buffer
   * @returns {void|*|Promise<any>}
   */
  async decryptAES(key, buffer) {
    // Asynchronous
    const { createDecipheriv } = await import('crypto');

    const iv = Buffer.from('00000000000000000000000000000000', 'hex');
    const encryptor = createDecipheriv('aes-256-cbc', key, iv);
    encryptor.write(buffer);
    encryptor.end();

    return encryptor.read();
  }
}
