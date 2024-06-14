export const MICRO3_CAMPAIGN = {
  GRAPH_QL: {
    MINT_NFT: `query CheckMintNft($from: String = null, $to: String = null, $heightGTE: Int = 0, $limit: Int = 10) {
      %s {
        erc721_activity(
          where: {
            _and: {
              from: {_eq: $from}, to: {_eq: $to}
              , height: {_gte: $heightGTE}
            }
          }, 
          limit: $limit) 
          {
          action
        }
      }
    }`,
    HOLD_AURA: `query CheckHoldAura($address: String = null) {
        %s {
          account_balance(where: {account: {evm_address: {_eq: $address}}}) {
            amount
            type
            denom
          }
        }
      }`,
    ADD_LP: `query CheckAddLiquidity($origin: Bytes!) {
        data: mints(where: {origin: $origin}) {
          origin
        }
      }`,
    SWAP: `query CheckSwap($origin: Bytes!) {
        data: swaps(where: {origin: $origin}) {
          id
        }
      }`,
  },
  OPERATION_NAME: {
    MINT_NFT: 'CheckMintNft',
    HOLD_AURA: 'CheckHoldAura',
    ADD_LP: 'CheckAddLiquidity',
    SWAP: 'CheckSwap',
  },
};

export enum ACTION_TYPE {
  MintNft = 'mint-nft',
  HoldAura = 'hold-aura',
  AddLiquidity = 'add-lp',
  Swap = 'swap-halo',
}

export enum HALO_ACTION_TYPE {
  AddLiquidity = 'add',
  Swap = 'swap',
}

export const MICRO3_QUEUES = {
  CAMPAIGN: {
    QUEUE_NAME: 'halo-micro3-campaign',
    JOBS: {
      HALO_ACTIVITY: 'halo-activity',
    },
  },
};

export const NATIVE = 'NATIVE';
export const NULL_EVM_ADDRESS = '0x0000000000000000000000000000000000000000';
