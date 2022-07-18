import { SmartContractCode } from "../entities/smart-contract-code.entity";

export class MappingDataHelper {
    static mappingContractCode(codeId: number, result: string, creator: string) {
        let contractCode = new SmartContractCode();
        contractCode.code_id = codeId;
        contractCode.result = result;
        contractCode.creator = creator;

        return contractCode;
    }
}