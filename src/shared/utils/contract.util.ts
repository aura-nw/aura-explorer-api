import {
  encodeSecp256k1Pubkey,
  pubkeyToAddress,
  serializeSignDoc,
} from '@cosmjs/amino';
import { Secp256k1, Secp256k1Signature, sha256 } from '@cosmjs/crypto';
import { fromBase64 } from '@cosmjs/encoding';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ContractUtil {
  /**
   * Verify signatue of contract
   * @param signature
   * @param msg
   * @param pubkey
   * @returns
   */
  async verifySignatue(signature: string, msg: string, pubkey: string) {
    try {
      const pubkeyFormated = encodeSecp256k1Pubkey(fromBase64(pubkey));
      const address = pubkeyToAddress(pubkeyFormated, 'aura');
      const msgDecode = this.createSignMessageByData(address, msg);

      const resultVerify = await Secp256k1.verifySignature(
        Secp256k1Signature.fromFixedLength(fromBase64(signature)),
        sha256(serializeSignDoc(msgDecode)),
        fromBase64(pubkey),
      );

      if (resultVerify) {
        return address;
      }
      return null;
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * Create message by data
   * @param address
   * @param data
   * @returns
   */
  private createSignMessageByData(address: string, data: string) {
    const signDoc = {
      chain_id: '',
      account_number: '0',
      sequence: '0',
      fee: {
        gas: '0',
        amount: [],
      },
      msgs: [
        {
          type: 'sign/MsgSignData',
          value: {
            signer: address,
            data: Buffer.from(data, 'utf8').toString('base64'),
          },
        },
      ],
      memo: '',
    };
    return signDoc;
  }
}
