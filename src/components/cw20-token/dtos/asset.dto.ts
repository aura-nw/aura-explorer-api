export class AssetDto {
  name: string;
  symbol: string;
  image: string;
  contract_address = '-';
  balance: number;
  max_total_supply = 0;
  price = 0;
  price_change_percentage_24h = 0;
  value = 0;
  denom = '';
  decimals = 0;
  verify_status = '';
  verify_text = '';
  type = '';
}
