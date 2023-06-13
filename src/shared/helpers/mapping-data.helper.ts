import { SmartContractCode } from '../entities/smart-contract-code.entity';

export class MappingDataHelper {
  static mappingContractCode(contractCode: any, type: string, result: string) {
    contractCode.type = type;
    contractCode.result = result;

    return contractCode;
  }
}
