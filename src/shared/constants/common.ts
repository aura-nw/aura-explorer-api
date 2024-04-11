export const VALIDATION_PIPE_OPTIONS = { transform: true };

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

export const INDEXER_V2_DB = process.env.INDEXER_V2_DB;

export const REQUEST_CHAIN_ID_HEADER = 'chain-id';

export const DEFAULT_CHAIN_ID_HEADER = process.env.INDEXER_CHAIN_ID;

export const REQUEST_ID_TOKEN_HEADER = 'x-request-id';

export const FORWARDED_FOR_TOKEN_HEADER = 'x-forwarded-for';

export enum CONTRACT_STATUS {
  EXACT_MATCH = 'EXACT MATCH',
  SIMILAR_MATCH = 'SIMILAR MATCH',
  UNVERIFIED = 'UNVERIFIED',
  VERIFYFAIL = 'FAIL',
  VERIFYING = 'VERIFYING',
  NOT_REGISTERED = 'Not registered',
  TBD = 'TBD',
  DEPLOYED = 'Deployed',
  REJECTED = 'Rejected',
  APPROVED = 'Approved',
  PENDING = 'Pending',
}

export enum CONTRACT_CODE_RESULT {
  TBD = 'TBD',
  CORRECT = 'Correct',
  INCORRECT = 'Incorrect',
}

export enum GECKOTERMINAL_API {
  GET_TOKEN_PRICE = 'networks/%s/pools/%s',
}

export enum COINGECKO_API {
  GET_COINS_MARKET = 'coins/markets?vs_currency=usd&ids=%s&order=market_cap_desc&per_page=%s&page=1&sparkline=false&price_change_percentage=24h',
}

export enum COIN_MARKET_CAP_API {
  GET_COINS_MARKET = 'cryptocurrency/quotes/latest?slug=%s',
}

export const COIN_MARKET_CAP = 'COIN_MARKET_CAP';

export const INDEXER_API_V2 = {
  GRAPH_QL: {
    PROPOSAL_COUNT: `query CountProposal { %s { proposal_aggregate { aggregate { count } } } }`,
    ACCOUNT: `query Account($address: String) { %s { account(where: {address: {_eq: $address}}) { %s } } }`,
    CONTRACT_CODE_LIST: `query ContractCode($where: %s_code_bool_exp, $limit: Int, $offset: Int) { %s { code(where: $where, order_by: {code_id: desc}, limit: $limit, offset: $offset) { %s } code_aggregate(where: $where) { aggregate { count } } } }`,
    CONTRACT_CODE_DETAIL: `query ContractCodeDetail($where: %s_code_bool_exp) { %s { code(where: $where) { %s } } }`,
    CW721_OWNER: `query CW721Owner($limit: Int, $burned: Boolean, $owner: String, $address: String, $tokenId: String, $nextKey: Int) { %s { cw721_token(limit: $limit, order_by: {created_at: desc}, where: {burned: {_eq: $burned}, cw721_contract: {smart_contract: {address: {_eq: $address}, name: {_neq: "crates.io:cw4973"}}}, owner: {_eq: $owner}, token_id: {_eq: $tokenId}, id: {_gt: $nextKey}}) { %s } } } `,
    CW4973_TOKEN_BY_MINTER: `query CW4973ByMinter($address: String, $minter: String, $limit: Int, $offset: Int) { %s { cw721_contract(limit: $limit, where: {smart_contract: {name: {_eq: "crates.io:cw4973"}, address: {_eq: $address}}, minter: {_eq: $minter}}, offset: $offset, order_by: {updated_at: desc}) { %s } cw721_contract_aggregate(where: {smart_contract: {name: {_eq: "crates.io:cw4973"}, address: {_eq: $address}}, minter: {_eq: $minter}}) { aggregate { count } } } }`,
    CW4973_CONTRACT: `query CW4973Contract($address: String, $minter: String) { %s { cw721_contract(where: {smart_contract: {name: {_eq: "crates.io:cw4973"}, address: {_eq: $address}}, minter: {_eq: $minter}}) { %s } } }`,
    VERIFY_STEP: `query VerifyStep($codeId: Int) { %s { code_id_verification(where: {code_id: {_eq: $codeId}}, order_by: {updated_at: desc}) { %s } } }`,
    CW20_OWNER: `query CW20Owner($limit: Int, $offset: Int, $owner: String, $name: String, $address: String) { %s { cw20_contract(limit: $limit, offset: $offset, where: {cw20_holders: {address: {_eq: $owner}, amount: {_gt: 0}}, name: {_ilike: $name}, smart_contract: {address: {_eq: $address}}}) { %s } } }`,
    CW20_HOLDER: `query CW20Holder($owner: String) { %s { cw20_contract(where: {cw20_holders: {address: {_eq: $owner}}}) { %s } } }`,
    VALIDATORS: `query Validators { %s { validator { %s } } }`,
    CW4973_STATUS: `query QueryCW4973Status($heightGT: Int, $limit: Int) { ${INDEXER_V2_DB} { cw721_activity(where: {cw721_contract: {smart_contract: {name: {_eq: "crates.io:cw4973"}}}, height: {_gt: $heightGT}}, order_by: {height: asc}, limit: $limit) { height tx { transaction_messages { content } } cw721_contract {smart_contract {address}} sender}}}`,
    TX_EXECUTED: `query QueryTxOfAccount($startTime: timestamptz = null, $endTime: timestamptz = null, $limit: Int = null, $listTxMsgType: [String!] = null, $listTxMsgTypeNotIn: [String!] = null, $heightGT: Int = null, $heightLT: Int = null, $order: order_by = desc, $address: String = null) {
      %s {
        transaction(where: {timestamp: {_lte: $endTime, _gte: $startTime}, transaction_messages: {type: {_in: $listTxMsgType, _nin: $listTxMsgTypeNotIn}, sender: {_eq: $address}}, _and: [{height: {_gt: $heightGT, _lt: $heightLT}}]}, limit: $limit, order_by: {id: $order}) {
          hash
          height
          fee
          timestamp
          code
          transaction_messages {
            type
            content
          }
          evm_transaction{
            hash
          }
        }
      }
    }`,
    TX_EVM_EXECUTED: `query QueryEvmTxOfAccount($startTime: timestamptz = null, $endTime: timestamptz = null, $heightGT: Int = null, $heightLT: Int = null, $limit: Int = null, $order: order_by = desc, $address: String = null) {
      %s {
        transaction: evm_transaction(where: {from: {_eq: $address}, transaction: {timestamp: {_gt: $startTime, _lt: $endTime}}, height: {_gt: $heightGT, _lt: $heightLT}}, limit: $limit, order_by: {id: $order}) {
          from
          to
          hash
          height
          data
          transaction {
            timestamp
            hash
            transaction_messages {
              content
            }
          }
        }
      }
    }`,
    TX_COIN_TRANSFER: `query QueryTxMsgOfAccount($from: String = "_", $to: String = "_", $startTime: timestamptz = null, $endTime: timestamptz = null, $heightGT: Int = null, $heightLT: Int = null, $limit: Int = null) {
      %s {
        transaction(where: {coin_transfers: {_or: [{from: {_eq: $from}}, {to: {_eq: $to}}], block_height: {_lt: $heightLT, _gt: $heightGT}}, timestamp: {_lte: $endTime, _gte: $startTime}}, limit: $limit, order_by: {height: desc}) {
          hash
          height
          fee
          timestamp
          code
          transaction_messages {
            type
            content
          }
          coin_transfers(where: {_or: [{from: {_eq: $from}}, {to: {_eq: $to}}]}) {
            from
            to
            amount
            denom
            block_height
          }
        }
      }
    }`,
    TX_TOKEN_TRANSFER: `query Cw20TXMultilCondition($receiver: String = null, $sender: String = null, $heightGT: Int = null, $heightLT: Int = null, $limit: Int = 100, $actionIn: [String!] = null, $startTime: timestamptz = null, $endTime: timestamptz = null) {
      %s {
        transaction: cw20_activity(where: {_or: [{to: {_eq: $receiver}}, {from: {_eq: $sender}}], cw20_contract: {}, action: {_in: $actionIn}, height: {_gt: $heightGT, _lt: $heightLT}, tx: {timestamp: {_lte: $endTime, _gte: $startTime}}}, order_by: {height: desc}, limit: $limit) {
          action
          amount
          from
          to
          sender
          cw20_contract {
            smart_contract {
              address
            }
            decimal
            symbol
          }
          tx {
            hash
            height
            timestamp
            code
            transaction_messages {
              type
              content
            }
          }
        }
      }
    }`,
    TX_ERC20_TRANSFER: `query queryListTxsERC20($to: String = null, $from: String = null, $startTime: timestamptz = null, $endTime: timestamptz = null, $heightGT: Int = null, $heightLT: Int = null, $limit: Int = 100, $actionIn: [String!] = null) {
      %s {
        transaction: erc20_activity(where: {_or: [{to: {_eq: $to}}, {from: {_eq: $from}}], action: {_in: $actionIn}, height: {_gt: $heightGT, _lt: $heightLT}, evm_transaction: {transaction: {timestamp: {_lte: $endTime, _gte: $startTime}}}}, order_by: {id: desc}, limit: $limit) {
          action
          amount
          from
          to
          height
          erc20_contract {
            decimal
            address
            symbol
          }
          tx_hash
          evm_transaction {
            data
            transaction {
              timestamp
            }
            transaction_message {
              type
            }
          }
        }
      }
    }`,
    TX_NFT_TRANSFER: `query Cw721TXMultilCondition(
      $receiver: String = null
      $sender: String = null
      $heightGT: Int = null
      $heightLT: Int = null
      $limit: Int = 100
      $actionIn: [String!] = null
      $startTime: timestamptz = null
      $endTime: timestamptz = null
    ) {
      %s {
        transaction: cw721_activity(
          where: {
            _or: [{ to: { _eq: $receiver } }, { from: { _eq: $sender } }]
            cw721_contract: {
              smart_contract: { name: { _neq: "crates.io:cw4973" } }
            }
            action: { _in: $actionIn }
            height: { _gt: $heightGT, _lt: $heightLT }
            tx: { timestamp: { _lte: $endTime, _gte: $startTime } }
          }
          order_by: { height: desc }
          limit: $limit
        ) {
          action
          from
          to
          sender
          cw721_contract {
            smart_contract {
              address
            }
            symbol
          }
          cw721_token {
            token_id
          }
          tx {
            hash
            height
            timestamp
            code
            transaction_messages {
              type
              content
            }
          }
        }
      }
    }
    `,
    EXECUTED_NOTIFICATION: `query ExecutedNotification($heightGT: Int, $heightLT: Int) {
      %s {
        executed: transaction(where: {height: {_gt: $heightGT, _lt: $heightLT}, code: {_eq: 0}}, order_by: {height: desc}, limit: 100) {
          height
          hash
          transaction_messages {
            type
            content
            sender
          }
        }
      }
    }
    `,
    COIN_TRANSFER_NOTIFICATION: `query CoinTransferNotification($heightGT: Int = null, $heightLT: Int = null) {
      %s {
        coin_transfer: transaction(where: {coin_transfers: {block_height: {_lt: $heightLT, _gt: $heightGT}}}, limit: 100, order_by: {height: desc}) {
          hash
          height
          transaction_messages {
            type
            content
          }
          coin_transfers {
            from
            to
            amount
            denom
          }
        }
      }
    }
    `,
    TOKEN_TRANSFER_NOTIFICATION: `query TokenTransferNotification($heightGT: Int, $heightLT: Int, $listFilterCW20: [String!] = null) {
      %s {
        token_transfer: cw20_activity(where: {height: {_gt: $heightGT, _lt: $heightLT}, amount: {_is_null: false}, action: {_in: $listFilterCW20}}, order_by: {height: desc}, limit: 100) {
          height
          tx_hash
          action
          amount
          from
          to
          cw20_contract {
            symbol
            decimal
            marketing_info
            name
          }
        }
      }
    }
    `,
    NFT_TRANSFER_NOTIFICATION: `query NftTransferNotification($heightGT: Int, $heightLT: Int, $listFilterCW721: [String!] = null) {
      %s {
        nft_transfer: cw721_activity(where: {action: {_in: $listFilterCW721}, cw721_token: {token_id: {_is_null: false}}, cw721_contract: {smart_contract: {name: {_neq: "crates.io:cw4973"}}}, height: {_gt: $heightGT, _lt: $heightLT}}, order_by: {height: desc}, limit: 100) {
          tx_hash
          height
          action
          from
          to
          cw721_token {
            token_id
            media_info
          }
        }
      }
    }
    `,
    CW4973_MEDIA_INFO: `query CW4973MediaInfo($owner: String) {
      ${INDEXER_V2_DB} {
        cw721_token(where: {owner: {_eq: $owner}, cw721_contract: {smart_contract: {name: {_eq: "crates.io:cw4973"}}}}) {
          token_id
          owner
          media_info
        }
      }
    }`,
    BASE_QUERY: `query BaseQuery {
      %s { %s } }`,
    LIST_VALIDATOR: `query ListValidator($address: [String!] = null) {
      %s {
        validator(where: {account_address: {_in: $address}}) {
          account_address
          operator_address
        }
      }
    }`,
    LIST_ACCOUNT: `query ListAccount($address: [String!] = null) {
      %s {
        account(where: {address: {_in: $address}}) {
          spendable_balances
          balances
          address
        }
      }
    }`,

    ASSETS: `query Assets(
      $from: timestamptz = null
      $id_gt: Int = null
    ) {
      %s {
        asset(
          where: { updated_at: { _gte: $from }, id: { _gt: $id_gt } }
          order_by: { id: asc }
        ) {
          decimal
          denom
          name
          total_supply
          type
          updated_at
          id
        }
      }
    }
  `,
    CW20_HOLDER_STAT: `query Cw20HolderStat($date_eq: date = null, $id_gt: Int = null) {
      %s {
        cw20_contract(
          where: { track: { _eq: true }, id: { _gt: $id_gt } }
          order_by: { id: asc }
        ) {
          smart_contract {
            address
          }
          cw20_total_holder_stats(
            where: { date: { _eq: $date_eq } }
            limit: 1
            order_by: { date: desc }
          ) {
            total_holder
            date
          }
          marketing_info
          symbol
          id
        }
      }
    }
  `,
    ERC20_INFO: `query Erc20Info($id_gt: Int = null) {
      %s {
        erc20_contract(where: {name: {_neq: ""}, id: {_gt: $id_gt}}, order_by: {id: asc}) {
          name
          address
          symbol
          id
        }
      }
    }
`,
  },
  OPERATION_NAME: {
    PROPOSAL_COUNT: 'CountProposal',
    ACCOUNT: 'Account',
    CW721_OWNER: 'CW721Owner',
    CW4973_TOKEN_BY_MINTER: 'CW4973ByMinter',
    CW4973_CONTRACT: 'CW4973Contract',
    CONTRACT_CODE_LIST: 'ContractCode',
    CONTRACT_CODE_DETAIL: 'ContractCodeDetail',
    VERIFY_STEP: 'VerifyStep',
    CW20_OWNER: 'CW20Owner',
    CW20_HOLDER: 'CW20Holder',
    VALIDATORS: 'Validators',
    CW4973_STATUS: 'QueryCW4973Status',
    TX_EXECUTED: 'QueryTxOfAccount',
    TX_EVM_EXECUTED: 'QueryEvmTxOfAccount',
    TX_COIN_TRANSFER: 'QueryTxMsgOfAccount',
    TX_ERC20_TRANSFER: 'queryListTxsERC20',
    TX_TOKEN_TRANSFER: 'Cw20TXMultilCondition',
    TX_NFT_TRANSFER: 'Cw721TXMultilCondition',
    EXECUTED_NOTIFICATION: 'ExecutedNotification',
    COIN_TRANSFER_NOTIFICATION: 'CoinTransferNotification',
    TOKEN_TRANSFER_NOTIFICATION: 'TokenTransferNotification',
    NFT_TRANSFER_NOTIFICATION: 'NftTransferNotification',
    CW4973_MEDIA_INFO: 'CW4973MediaInfo',
    BASE_QUERY: 'BaseQuery',
    LIST_VALIDATOR: 'ListValidator',
    LIST_ACCOUNT: 'ListAccount',
    ASSETS: 'Assets',
    CW20_HOLDER_STAT: 'Cw20HolderStat',
    ERC20_INFO: 'Erc20Info',
  },
  MAX_REQUEST: 100,
};

export enum AURA_INFO {
  ADDRESS_PREFIX = 'aura',
  COIN_ID = 'aura-network',
  IMAGE = 'https://nft-ipfs.s3.amazonaws.com/assets/imgs/icons/color/aura.svg',
  NAME = 'Aura',
}

export enum LENGTH {
  CONTRACT_ADDRESS_NO_PREFIX = 59,
  ACCOUNT_ADDRESS_NO_PREFIX = 39,
}

export const ERROR_MAP = {
  CONTRACT_VERIFIED: {
    Code: 'E001',
    Message: `Contract has been verified`,
  },
  CONTRACT_NOT_EXIST: {
    Code: 'E002',
    Message: `Contract isn't existed`,
  },
  CONTRACT_CODE_ID_EXIST: {
    Code: 'E003',
    Message: `This Code ID has already been registered type`,
  },
  CONTRACT_CODE_ID_NOT_EXIST: {
    Code: 'E004',
    Message: `Code ID does not exist`,
  },
  NOT_CONTRACT_CREATOR: {
    Code: 'E005',
    Message: `You are not the Code ID's owner`,
  },
  CANNOT_UPDATE_CONTRACT_CODE: {
    Code: 'E006',
    Message: `Result is correct, you cannot update this record`,
  },
  MINTER_OR_CONTRACT_ADDRESS_INVALID: {
    Code: 'E007',
    Message: `Creator address or contract address invalid`,
  },
  YOUR_ADDRESS_INVALID: {
    Code: 'E008',
    Message: `Receiver address invalid`,
  },
  TOKEN_NOT_EXIST: {
    Code: 'E009',
    Message: `Token not exist`,
  },
  TOKEN_URI_INVALID: {
    Code: 'E010',
    Message: `Token URI invalid`,
  },
  ER_DUP_ENTRY: {
    Code: 'E011',
    Message: `Token is duplicate`,
  },
  PICKED_TOKEN_OVERSIZE: {
    Code: 'E012',
    Message: `You can only pick maximun 5 Account Bound tokens to display. If you want to display this Account Bound Token, please un-pick the previous picked one`,
  },

  PICKED_TOKEN_UNDERSIZE: {
    Code: 'E013',
    Message: `You can not un-pick the last picked ABT in your account. In order to un-pick this token, you need to pick another equipped ABT first then un-pick it later`,
  },

  VERIFY_IMG_TYPE: {
    Code: 'E014',
    Message: `Can't verify image content-type`,
  },

  TAKE_SELF_TOKEN: {
    Code: 'E015',
    Message: `You can not attest a Account Bound Token for yourself`,
  },

  CONTRACT_VERIFIED_VERIFYING: {
    Code: 'E016',
    Message: `Contract has been verified or verifying`,
  },

  REJECT_ABT_TOKEN: {
    Code: 'E017',
    Message: `This receiver has rejected all Account Bound Tokens from you`,
  },
  INFRASTRUCTURE_ERROR: {
    Code: 'E018',
    Message: `Infrastructure overload, cannot process. Please try again!`,
  },
};

export const INFRASTRUCTURE_ERROR = {
  STEP: 4,
  FAIL: 'FAIL',
};

export const ADMIN_ERROR_MAP = {
  DUPLICATE_ADDRESS: {
    Code: 'E001',
    Message: 'This address has already been set %s name tag',
  },
  DUPLICATE_TAG: {
    Code: 'E002',
    Message: 'Duplicate name tag',
  },
  DUPLICATE_PRIVATE_TAG: {
    Code: 'E002',
    Message: 'Duplicate private name tag',
  },
  INVALID_FORMAT: {
    Code: 'E003',
    Message: `Invalid %s address format`,
  },
  INVALID_TYPE_ADDRESS: {
    Code: 'E007',
    Message: 'Invalid type address',
  },
  INVALID_EVM_FORMAT: {
    Code: 'E003',
    Message: `Invalid EVM address format`,
  },
  INVALID_NAME_TAG: {
    Code: 'E004',
    Message:
      'Name tag not accept special character except dot(.), dash(-), underscore(_)',
  },
  INVALID_URL: {
    Code: 'E005',
    Message: 'Invalid URL format',
  },
  LIMIT_PRIVATE_NAME_TAG: {
    Code: 'E006',
    Message: `You have reached out of ${
      process.env.LIMITED_PRIVATE_NAME_TAG || 10
    } max limitation of private name tag`,
  },
};

export const PAGE_REQUEST = {
  MIN: 1,
  MAX: 100,
  MAX_200: 200,
  MAX_500: 500,
};

export enum ASSETS_TYPE {
  IBC = 'IBC_TOKEN',
  CW20 = 'CW20_TOKEN',
  NATIVE = 'NATIVE',
  ERC20 = 'ERC20_TOKEN',
}

export enum SOULBOUND_TOKEN_STATUS {
  UNCLAIM = 'Unclaimed',
  EQUIPPED = 'Equipped',
  UNEQUIPPED = 'Unequipped',
  PENDING = 'Pending',
  REJECTED = 'Rejected',
}

export const SOULBOUND_PICKED_TOKEN = {
  MIN: 1,
  MAX: 5,
};

export enum CW4973_CONTRACT {
  AGREEMENT = 'Agreement(string chain_id,address active,address passive,string tokenURI)',
}

export enum VERIFY_CODE_RESULT {
  FAIL = 'Fail',
  IN_PROGRESS = 'In-progress',
  SUCCESS = 'Success',
  PENDING = 'Pending',
}

export const DEFAULT_IPFS = 'https://ipfs.io/';

export enum USER_ROLE {
  USER = 'user',
  ADMIN = 'admin',
  BANNED = 'banned',
}

export enum PROVIDER {
  FACEBOOK = 'facebook',
  GOOGLE = 'google',
  PASSWORD = 'password',
}

export enum SITE {
  MAIN = 'main',
  ADMIN = 'admin',
}

export enum NAME_TAG_TYPE {
  ACCOUNT = 'account',
  CONTRACT = 'contract',
}

export const MESSAGES = {
  ERROR: {
    NOT_PERMISSION: 'You have not permission!',
    BANNED: 'You have been banned.',
    BAD_REQUEST: 'Bad request.',
    SOME_THING_WRONG: 'Something went wrong.',
    NEED_TO_BE_LOGGED_IN_AGAIN: {
      CODE: 'E001',
      MESSAGE: 'You need to log in again using new password.',
    },
  },
};

export const VERIFY_STEP = [
  { name: 'Code ID valid', msgCode: 'S001' },
  { name: 'Compiler image format', msgCode: 'S002' },
  { name: 'Code ID verification session valid', msgCode: 'S003' },
  { name: 'Get Code ID data hash', msgCode: 'S004' },
  { name: 'Get source code', msgCode: 'S005' },
  { name: 'Compile source code', msgCode: 'S006' },
  { name: 'Compare data hash', msgCode: 'S007' },
  { name: 'Internal process', msgCode: 'S008' },
];

export const ROLES_KEY = 'roles';

export const REGEX_PARTERN = {
  NAME_TAG: new RegExp(/^[a-zA-Z0-9._-\s]+$/),
  URL: new RegExp(/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/),
  PASSWORD: new RegExp(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[`~!@#$%^&*()_+{}|/:;",.?<>\[\]`])[A-Za-z\d~!@#$%^&*()_+{}|/:;",.?<>\[\]]{8,}$/,
  ),
};

export enum USER_ACTIVITIES {
  SEND_MAIL_VERIFY = 'SEND_MAIL_VERIFY',
  SEND_MAIL_RESET_PASSWORD = 'SEND_MAIL_RESET_PASSWORD',
  DAILY_NOTIFICATIONS = 'DAILY_NOTIFICATIONS',
}

export const MSGS_ACTIVE_USER = {
  SA001: { message: 'Success', code: 'SA001' },
  EA001: { message: 'User already verified', code: 'EA001' },
  EA002: { message: 'User not found', code: 'EA002' },
  EA003: { message: 'Token not match', code: 'EA003' },
};

export const SUPPORT_EMAIL = 'support@aura.netwwork';

export const QUEUES = {
  SEND_MAIL: {
    QUEUE_NAME: 'send-mail',
    JOB: 'job-send-mail',
  },
  TOKEN: {
    QUEUE_NAME: 'asset',
    JOB_SYNC_TOKEN_PRICE: 'sync-token-price',
    JOB_SYNC_CW20_PRICE: 'sync-cw20-price',
    JOB_SYNC_ASSET: 'sync-asset',
    JOB_SYNC_NATIVE_ASSET_HOLDER: 'sync-native-asset-holder',
    JOB_SYNC_CW20_ASSET_HOLDER: 'sync-cw20-asset-holder',
    JOB_SYNC_ERC20_ASSET_HOLDER: 'sync-erc20-asset-holder',
    JOB_CLEAN_ASSET_HOLDER: 'clean-asset-holder',
  },
  CW4973: {
    QUEUE_NAME: 'cw4973',
    JOBS: {
      SYNC_ID_STATUS: 'cw4973-id-status',
      SYNC_4973_STATUS: 'cw4973-status',
    },
  },
  NOTIFICATION: {
    QUEUE_NAME: 'notification',
    JOBS: {
      NOTIFICATION_EXECUTED: 'notification_executed',
      NOTIFICATION_COIN_TRANSFER: 'notification_coin_transfer',
      NOTIFICATION_TOKEN_TRANSFER: 'notification_token_transfer',
      NOTIFICATION_NFT_TRANSFER: 'notification_nft_transfer',
      RESET_NOTIFICATION: 'reset_notification',
    },
  },
};

export const SYNC_SERVICE_QUEUES = {
  SMART_CONTRACT: 'smart-contracts',
};

export const MSGS_USER = {
  EU001: { message: 'User must be verified.', code: 'EU001' },
  EU002: { message: 'Wrong email or password.', code: 'EU002' },
};

export const AURA_LOGO = 'aura-logo.jpg';

export enum TOKEN_COIN {
  NATIVE = 'native',
  IBC = 'ibc',
  CW20 = 'cw20',
}

export enum SYNC_POINT_TYPE {
  CW4973_BLOCK_HEIGHT = 'CW4973_BLOCK_HEIGHT',
  EXECUTED_HEIGHT = 'EXECUTED_BLOCK_HEIGHT',
  COIN_TRANSFER_HEIGHT = 'COIN_TRANSFER_HEIGHT',
  TOKEN_TRANSFER_HEIGHT = 'TOKEN_TRANSFER_HEIGHT',
  NFT_TRANSFER_HEIGHT = 'NFT_TRANSFER_HEIGHT',
  FIRST_TIME_SYNC_ASSETS = 'FIRST_TIME_SYNC_ASSETS',
}

export const TX_HEADER = {
  EXECUTED: [
    'TxHash',
    'MessageRaw',
    'Message',
    'Result',
    {
      label: 'Timestamp (UTC)',
      value: 'Timestamp',
    },
    'UnixTimestamp',
    'Fee',
    'BlockHeight',
    'EvmTxHash',
  ],
  EVM_EXECUTED: [
    'EvmTxHash',
    'Method',
    'Height',
    {
      label: 'Timestamp (UTC)',
      value: 'Timestamp',
    },
    'UnixTimestamp',
    'FromAddress',
    'ToAddress',
    'Amount',
    'Symbol',
    'CosmosTxHash',
  ],
  COIN_TRANSFER: [
    'TxHash',
    'MessageRaw',
    'Message',
    {
      label: 'Timestamp (UTC)',
      value: 'Timestamp',
    },
    'UnixTimestamp',
    'FromAddress',
    'ToAddress',
    'AmountIn',
    'AmountOut',
    'Symbol',
    'Denom',
  ],
  TOKEN_TRANSFER: [
    'TxHash',
    'MessageRaw',
    'Message',
    {
      label: 'Timestamp (UTC)',
      value: 'Timestamp',
    },
    'UnixTimestamp',
    'FromAddress',
    'ToAddress',
    'AmountIn',
    'AmountOut',
    'Symbol',
    'TokenContractAddress',
  ],
  NFT_TRANSFER: [
    'TxHash',
    'MessageRaw',
    'Message',
    {
      label: 'Timestamp (UTC)',
      value: 'Timestamp',
    },
    'UnixTimestamp',
    'FromAddress',
    'ToAddress',
    'TokenIdIn',
    'TokenIdOut',
    'NFTContractAddress',
  ],
  EVM_EXECUTED_NAMETAG: [
    'EvmTxHash',
    'Method',
    'Height',
    {
      label: 'Timestamp (UTC)',
      value: 'Timestamp',
    },
    'UnixTimestamp',
    'FromAddress',
    'FromAddressPrivateNameTag',
    'ToAddress',
    'ToAddressPrivateNameTag',
    'Amount',
    'Symbol',
    'ComosTxHash',
  ],
  COIN_TRANSFER_NAMETAG: [
    'TxHash',
    'MessageRaw',
    'Message',
    {
      label: 'Timestamp (UTC)',
      value: 'Timestamp',
    },
    'UnixTimestamp',
    'FromAddress',
    'FromAddressPrivateNameTag',
    'ToAddress',
    'ToAddressPrivateNameTag',
    'AmountIn',
    'AmountOut',
    'Symbol',
    'Denom',
  ],
  TOKEN_TRANSFER_NAMETAG: [
    'TxHash',
    'MessageRaw',
    'Message',
    {
      label: 'Timestamp (UTC)',
      value: 'Timestamp',
    },
    'UnixTimestamp',
    'FromAddress',
    'FromAddressPrivateNameTag',
    'ToAddress',
    'ToAddressPrivateNameTag',
    'AmountIn',
    'AmountOut',
    'Symbol',
    'TokenContractAddress',
  ],
  NFT_TRANSFER_NAMETAG: [
    'TxHash',
    'MessageRaw',
    'Message',
    {
      label: 'Timestamp (UTC)',
      value: 'Timestamp',
    },
    'UnixTimestamp',
    'FromAddress',
    'FromAddressPrivateNameTag',
    'ToAddress',
    'ToAddressPrivateNameTag',
    'TokenIdIn',
    'TokenIdOut',
    'NFTContractAddress',
  ],
};

export const QUERY_LIMIT_RECORD = 100;
export const EXPORT_LIMIT_RECORD = 1000;
export const LIMIT_PRIVATE_NAME_TAG = 500;
export const LIMIT_HOLDER_ADDRESS = 5;

export const NOTIFICATION = {
  TYPE: {
    EXECUTED: 'EXECUTED',
    COIN_TRANSFER: 'COIN_TRANSFER',
    TOKEN_TRANSFER: 'TOKEN_TRANSFER',
    NFT_TRANSFER: 'NFT_TRANSFER',
  },
  TITLE: {
    EXECUTED: 'Executed',
    TOKEN_SENT: 'Token Sent',
    TOKEN_RECEIVED: 'Token Received',
    NFT_SENT: 'NFT Sent',
    NFT_RECEIVED: 'NFT Received',
    COIN_SENT: 'Coin Sent',
    COIN_RECEIVED: 'Coin Received',
  },
  STATUS: {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
  },
};

export const WATCH_LIST = {
  NOTE_MAX_LENGTH: 200,
  TYPE: NAME_TAG_TYPE,
  SETTINGS_EXAMPLE: {
    transactionExecuted: true,
    tokenSent: true,
    tokenReceived: true,
    nftSent: true,
    nftReceived: true,
    nativeCoinSent: {
      turnOn: true,
      inactiveAutoRestake: true,
    },
    nativeCoinReceived: {
      turnOn: true,
      inactiveAutoRestake: true,
    },
  },
  ERROR_MSGS: {
    ERR_UNIQUE_ADDRESS: 'This address has already been added to watch list.',
    ERR_ADDRESS_NOT_FOUND: 'Address not found.',
    ERR_LIMIT_ADDRESS: `You have reached out of ${
      process.env.WATCH_LIST_LIMIT_ADDRESS || 10
    } max limitation of address.`,
    ERR_INVALID_ADDRESS: `Invalid %s format address.`,
  },
};

export const RPC_QUERY_URL = {
  DELEGATOR_DELEGATIONS: '/cosmos.staking.v1beta1.Query/DelegatorDelegations',
  DELEGATOR_UNBONDING_DELEGATIONS:
    '/cosmos.staking.v1beta1.Query/DelegatorUnbondingDelegations',
  DELEGATION_TOTAL_REWARDS:
    '/cosmos.distribution.v1beta1.Query/DelegationTotalRewards',
  VALIDATOR_COMMISSION:
    '/cosmos.distribution.v1beta1.Query/ValidatorCommission',
  EVM_CODES_ADDRESS: '/ethermint.evm.v1.Query/Code',
};

export const TYPE_ORM_ERROR_CODE = {
  ER_DUP_ENTRY: 'ER_DUP_ENTRY',
};

export const COSMOS = {
  ADDRESS_LENGTH: {
    ACCOUNT_HEX: 39,
    CONTRACT_HEX: 59,
  },
};

export const EVM_EXTENSIONS = [
  '0x0000000000000000000000000000000000000001',
  '0x0000000000000000000000000000000000000002',
  '0x0000000000000000000000000000000000000003',
  '0x0000000000000000000000000000000000000004',
  '0x0000000000000000000000000000000000000005',
  '0x0000000000000000000000000000000000000006',
  '0x0000000000000000000000000000000000000007',
  '0x0000000000000000000000000000000000000008',
  '0x0000000000000000000000000000000000000009',
  '0x0000000000000000000000000000000000000400',
  '0x0000000000000000000000000000000000000800',
  '0x0000000000000000000000000000000000000801',
  '0x0000000000000000000000000000000000000802',
  '0x0000000000000000000000000000000000000803',
  '0x0000000000000000000000000000000000000804',
];
