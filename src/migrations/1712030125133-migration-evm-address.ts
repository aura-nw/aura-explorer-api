/* eslint-disable @typescript-eslint/no-empty-function */
import { LENGTH } from 'src/shared';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { toChecksumAddress } from 'crypto-addr-codec';
import { fromBech32 } from '@cosmjs/encoding';

export class migrationEvmAddress1710993499417 implements MigrationInterface {
  name = 'migrationEvmAddress1710993499417';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SET SQL_SAFE_UPDATES = 0`);
    await Promise.all([
      this.processStoreData('public_name_tag', queryRunner),
      this.processStoreData('private_name_tag', queryRunner),
      this.processStoreData('watch_list', queryRunner),
    ]);
    await queryRunner.query(`SET SQL_SAFE_UPDATES = 1`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(queryRunner: QueryRunner): Promise<void> {}

  private async processStoreData(table: string, queryRunner: QueryRunner) {
    const data = await queryRunner.query(
      `SELECT p.id, p.address, p.evm_address , e.address_prefix
      FROM \`${table}\` p
      LEFT JOIN \`explorer\` e ON
      p.explorer_id = e.id
      WHERE evm_address IS NULL`,
    );
    for (const item of data) {
      const addressNoPrefix = item.address?.replace(item.address_prefix, '');
      if (addressNoPrefix.length !== LENGTH.CONTRACT_ADDRESS_NO_PREFIX) {
        item.evm_address = this.convertBech32AddressToEvmAddress(
          item.address_prefix,
          item.address,
        );
        console.log(item);
        await queryRunner.query(
          `UPDATE ${table} set evm_address = '${item.evm_address}' where id = ${item.id}`,
        );
      }
    }
  }

  /**
   * Returns a function that decodes a Bech32 string into a Buffer, using the provided currentPrefix.
   *
   * @param {string} input - The Bech32 string to decode.
   * @return {Buffer} The decoded Buffer.
   */
  private makeBech32Decoder(currentPrefix: string) {
    return (input: string) => {
      const { prefix, data } = fromBech32(input);
      if (prefix !== currentPrefix) {
        throw Error('Unrecognised address format');
      }
      return Buffer.from(data);
    };
  }

  /**
   * Returns a function that takes a Buffer and returns the checksummed hex encoding of the data.
   *
   * @param {number} chainId - The chain ID to be used for checksum calculation (optional)
   * @return {Function} - A function that takes a Buffer and returns the checksummed hex encoding
   */
  private makeChecksummedHexEncoder(chainId?: number) {
    return (data: Buffer) =>
      toChecksumAddress(data.toString('hex'), chainId || null);
  }

  /**
   * Converts a Bech32 address to an EVM address.
   *
   * @param {string} prefix - The prefix of the Bech32 address.
   * @param {string} bech32Address - The Bech32 address to be converted.
   * @return {string} The converted EVM address.
   */
  private convertBech32AddressToEvmAddress(
    prefix: string,
    bech32Address: string,
  ): string {
    try {
      const data = this.makeBech32Decoder(prefix)(bech32Address);
      return this.makeChecksummedHexEncoder()(data)?.toLowerCase();
    } catch (err) {
      return null;
    }
  }
}
