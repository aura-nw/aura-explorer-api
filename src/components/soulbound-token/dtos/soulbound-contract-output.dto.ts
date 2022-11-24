import { classToClass } from "class-transformer";

export class  SoulboundContractOutputDto{
    smart_contract_id: number;
    contract_address: string;
    total: number;
    claimed_qty: number;
    unclaimed_qty: number;
    picked: boolean;    
}