export class AssetDto {
    name: string;
    symbol: string;
    image: string;
    contract_address: string = '-';
    balance: number;
    decimals: string = '-';
    max_total_supply: string = '-';
    price: string = '-';
    price_change_percentage_24h: string = '-';
    value: string = '-';
    denom: string = '-';
}