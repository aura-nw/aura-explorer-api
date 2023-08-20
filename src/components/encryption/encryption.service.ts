import { Inject, Injectable } from '@nestjs/common';
import * as appConfig from '../../shared/configs/configuration';
import { KMS } from 'aws-sdk';

import {
  buildClient,
  CommitmentPolicy,
  RawAesWrappingSuiteIdentifier,
} from '@aws-crypto/client-node';
import { InjectRepository } from '@nestjs/typeorm';
import { CipherKey } from '../../shared/entities/cipher-key.entity';
import { Repository } from 'typeorm';
import { PlaintextType } from 'aws-sdk/clients/kms';
import { ENCRYPTION_CONFIG } from './encryption.contants';
import { EncryptionModuleOptions } from './encryption.interface';

@Injectable()
export class EncryptionService {
  private config;
  private kms: KMS;

  constructor(
    @InjectRepository(CipherKey)
    private readonly cipherKeyRepository: Repository<CipherKey>,
    @Inject(ENCRYPTION_CONFIG)
    private options: EncryptionModuleOptions,
  ) {
    this.config = appConfig.default();

    this.kms = new KMS({
      accessKeyId: this.config.kms.accessKeyId,
      secretAccessKey: this.config.kms.secretAccessKey,
      region: this.config.kms.region,
      apiVersion: this.config.kms.apiVersion,
    });
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

  public async printKey() {
    const keyTemp = await this.options.key;
    console.log(keyTemp);
    return;
    const { encrypt, decrypt } = buildClient(
      CommitmentPolicy.REQUIRE_ENCRYPT_REQUIRE_DECRYPT,
    );

    const keyName = 'aes-name';
    const keyNamespace = 'aes-namespace';

    /* The wrapping suite defines the AES-GCM algorithm suite to use. */
    const wrappingSuite =
      RawAesWrappingSuiteIdentifier.AES256_GCM_IV12_TAG16_NO_PADDING;

    // Get your plaintext master key from wherever you store it.
    // const unencryptedMasterKey = new TextEncoder().encode(kdf); // always utf-8
    // console.log('0:', unencryptedMasterKey);

    // const generatorKeyId = 'arn:aws:kms:us-east-2:893266769517:alias/test_kms';
    const KeyId = this.config.kms.alias;
    // // const additionalKey = 'arn:aws:kms:us-east-2:893266769517:key/e4992a35-f352-4098-9a8b-318f680f4a73';
    // const additionalKey = this.config.kms.alias;
    const KeySpec = 'AES_256';
    const { CiphertextBlob, Plaintext } = await this.kms
      .generateDataKey({ KeyId, KeySpec })
      .promise();
    console.log('0:', CiphertextBlob);
    console.log('0:', CiphertextBlob.toString('hex'));

    const cipherTextBlob = await this.encryptAES(Plaintext, 'ciphertext');

    console.log('1:', cipherTextBlob.toString('hex'));
    console.log('2:', Plaintext.toString('hex'));

    // for (let i = 0; i < (Plaintext as Uint8Array).length; i++) {
    //     Plaintext[i] = null;
    // }
    const temp = Buffer.from(CiphertextBlob.toString('hex'), 'hex');
    console.log('0:', temp);
    const key = await this.kms.decrypt({ CiphertextBlob: temp }).promise();
    console.log('3:', key.Plaintext);

    const dataBuffer = await this.decryptAES(key.Plaintext, cipherTextBlob);
    console.log('4:', dataBuffer.toString('utf-8'));

    // const keyring = new KmsKeyringNode({ generatorKeyId, keyIds: [additionalKey] });

    // /* Configure the Raw AES keyring. */
    // const keyring = new RawAesKeyringNode({
    //     keyName,
    //     keyNamespace,
    //     unencryptedMasterKey: Plaintext as Uint8Array,
    //     wrappingSuite,
    // })
    // console.log(keyring);

    // const context = {
    //     stage: 'demo',
    //     purpose: 'simple demonstration app',
    //     origin: 'ap-southeast-1',
    // }

    // /* Encrypt the data. */
    // const clearText = 'asdf'

    // const { result } = await encrypt(keyring, clearText, { encryptionContext: context })

    // console.log('1:', result.toString('hex'));

    // /* Decrypt the data. */
    // const { plaintext, messageHeader } = await decrypt(keyring, result)

    // /* Grab the encryption context so you can verify it. */
    // const { encryptionContext } = messageHeader;

    // Object.entries(context).forEach(([key, value]) => {
    //     if (encryptionContext[key] !== value)
    //         throw new Error('Encryption Context does not match expected values')
    // });

    // console.log('2:', encryptionContext);
    // console.log('3:', plaintext);
  }

  public async getKey(): Promise<PlaintextType> {
    let cipherKey = await this.cipherKeyRepository.findOne();

    if (!cipherKey) {
      this.addCipherKey();
      cipherKey = await this.cipherKeyRepository.findOne();
    }

    const CiphertextBlob = Buffer.from(cipherKey.cipher_text, 'hex');
    const key = await this.kms.decrypt({ CiphertextBlob }).promise();

    return key.Plaintext;
  }

  /**
   * Encrypt the data using AES-256
   * @param key
   * @param buffer
   * @returns {void|*|Promise<any>}
   */
  public async encryptAES(key, buffer) {
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
  public async decryptAES(key, buffer) {
    // Asynchronous
    const { createDecipheriv } = await import('crypto');
    const iv = Buffer.from('00000000000000000000000000000000', 'hex');
    const encryptor = createDecipheriv('aes-256-cbc', key, iv);
    encryptor.write(buffer);
    encryptor.end();

    return encryptor.read();
  }
}
