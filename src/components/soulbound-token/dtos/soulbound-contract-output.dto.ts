import { classToClass } from 'class-transformer';

export class SoulboundContractOutputDto {
  contract_address: string;
  total: number;
  claimed_qty: number;
  unclaimed_qty: number;
  picked: boolean;
}
