export class MappingDataHelper {
  static mappingContractCode(contractCode: any, type: string, result: string) {
    contractCode.type = type;
    contractCode.result = result;

    return contractCode;
  }
}
