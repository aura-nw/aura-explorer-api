export const VALIDATION_PIPE_OPTIONS = { transform: true };

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

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
    CW4973_STATUS: `query QueryCW4973Status($heightGT: Int, $limit: Int) { ${process.env.INDEXER_V2_DB} { cw721_activity(where: {cw721_contract: {smart_contract: {name: {_eq: "crates.io:cw4973"}}}, height: {_gt: $heightGT}}, order_by: {height: asc}, limit: $limit) { height tx { data} cw721_contract {smart_contract {address}} sender}}}`,
    TX_EXECUTED: `query QueryTxOfAccount($startTime: timestamptz = null, $endTime: timestamptz = null, $limit: Int = null, $listTxMsgType: [String!] = null, $listTxMsgTypeNotIn: [String!] = null, $heightGT: Int = null, $heightLT: Int = null, $orderHeight: order_by = desc, $address: String = null) {
      ${process.env.INDEXER_V2_DB} {
        transaction(where: {timestamp: {_lte: $endTime, _gte: $startTime}, transaction_messages: {type: {_in: $listTxMsgType, _nin: $listTxMsgTypeNotIn}, sender: {_eq: $address}}, _and: [{height: {_gt: $heightGT, _lt: $heightLT}}]}, limit: $limit, order_by: {height: $orderHeight}) {
          hash
          height
          fee
          timestamp
          code
          transaction_messages {
            type
            content
          }
        }
      }
    }`,
    TX_COIN_TRANSFER: `query QueryTxMsgOfAccount($compositeKeyIn: [String!] = null, $address: String = null, $startTime: timestamptz = null, $endTime: timestamptz = null, $limit: Int = null, $listTxMsgType: [String!] = null, $listTxMsgTypeNotIn: [String!] = null, $heightGT: Int = null, $heightLT: Int = null, $orderHeight: order_by = desc) {
      ${process.env.INDEXER_V2_DB} {
        transaction(where: {event_attribute_index: {composite_key: {_in: $compositeKeyIn}, value: {_eq: $address}, event: {tx_msg_index: {_is_null: false}}}, timestamp: {_lte: $endTime, _gte: $startTime}, transaction_messages: {type: {_in: $listTxMsgType, _nin: $listTxMsgTypeNotIn}}, _and: [{height: {_gt: $heightGT, _lt: $heightLT}}]}, limit: $limit, order_by: {height: $orderHeight}) {
          hash
          height
          fee
          timestamp
          code
          transaction_messages {
            type
            content
          }
          events(where: {type: {_eq: "transfer"}, tx_msg_index: {_is_null: false}, event_attribute_index: {composite_key: {_in: $compositeKeyIn}, value: {_eq: $address}}}) {
            event_attributes {
              composite_key
              value
            }
          }
        }
      }
    }`,
    TX_TOKEN_TRANSFER: `query Cw20TXMultilCondition($receiver: String = null, $sender: String = null, $contractAddr: String = null, $startTime: timestamptz = null, $endTime: timestamptz = null, $listTxMsgType: [String!] = null, $listTxMsgTypeNotIn: [String!] = null, $heightGT: Int = null, $heightLT: Int = null, $limit: Int = null, $txHash: String = null, $actionIn: [String!] = null, $actionNotIn: [String!] = null) {
      ${process.env.INDEXER_V2_DB} {
        transaction(where: {events: {smart_contract_events: {cw20_activities: {_or: [{to: {_eq: $receiver}}, {from: {_eq: $sender}}], action: {_in: $actionIn, _nin: $actionNotIn}}, smart_contract: {address: {_eq: $contractAddr}}}}, timestamp: {_gte: $startTime, _lte: $endTime}, _and: {height: {_gt: $heightGT, _lt: $heightLT}, hash: {_eq: $txHash}}, transaction_messages: {type: {_in: $listTxMsgType, _nin: $listTxMsgTypeNotIn}}}, order_by: {height: desc}, limit: $limit) {
          gas_used
          hash
          height
          timestamp
          code
          transaction_messages {
            content
            type
          }
          events(where: {smart_contract_events: {cw20_activities: {_or: [{to: {_eq: $receiver}}, {from: {_eq: $sender}}], id: {_is_null: false}}}}) {
            smart_contract_events {
              cw20_activities {
                amount
                action
                from
                to
                sender
              }
              smart_contract {
                address
                cw20_contract {
                  symbol
                  decimal
                }
              }
            }
          }
        }
      }
    }`,
    TX_NFT_TRANSFER: `query Cw721TXMultilCondition($receiver: String = null, $sender: String = null, $startTime: timestamptz = null, $endTime: timestamptz = null, $listTxMsgType: [String!] = null, $listTxMsgTypeNotIn: [String!] = null, $heightGT: Int = null, $heightLT: Int = null, $limit: Int = null, $contractAddr: String = null, $tokenId: String = null, $txHash: String = null, $neqCw4973: String, $eqCw4973: String = null, $actionIn: [String!] = null, $actionNotIn: [String!] = null) {
      ${process.env.INDEXER_V2_DB} {
        transaction(where: {events: {smart_contract_events: {cw721_activity: {_or: [{to: {_eq: $receiver}}, {from: {_eq: $sender}}], cw721_token: {token_id: {_eq: $tokenId}}, action: {_in: $actionIn, _nin: $actionNotIn}}, smart_contract: {name: {_neq: $neqCw4973, _eq: $eqCw4973}, address: {_eq: $contractAddr}}}}, timestamp: {_gte: $startTime, _lte: $endTime}, _and: {height: {_gt: $heightGT, _lt: $heightLT}, hash: {_eq: $txHash}}, transaction_messages: {type: {_in: $listTxMsgType, _nin: $listTxMsgTypeNotIn}}}, order_by: {height: desc}, limit: $limit) {
          gas_used
          hash
          height
          timestamp
          code
          transaction_messages {
            content
            type
          }
          events(where: {smart_contract_events: {cw721_activity: {id: {_is_null: false}, _or: [{to: {_eq: $receiver}}, {from: {_eq: $sender}}], cw721_token: {token_id: {_eq: $tokenId}}}}}) {
            smart_contract_events {
              cw721_activity {
                action
                from
                to
                sender
                cw721_token {
                  token_id
                }
                cw721_contract {
                  smart_contract {
                    address
                  }
                }
              }
            }
          }
          event_attribute_index(where: {composite_key: {_eq: "wasm.spender"}}) {
            composite_key
            key
            value
          }
        }
      }
    }`,
    CW4973_MEDIA_INFO: `query CW4973MediaInfo($owner: String) {
      ${process.env.INDEXER_V2_DB} {
        cw721_token(where: {owner: {_eq: $owner}, cw721_contract: {smart_contract: {name: {_eq: "crates.io:cw4973"}}}}) {
          token_id
          owner
          media_info
        }
      }
    }`,
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
    TX_COIN_TRANSFER: 'QueryTxMsgOfAccount',
    TX_TOKEN_TRANSFER: 'Cw20TXMultilCondition',
    TX_NFT_TRANSFER: 'Cw721TXMultilCondition',
    CW4973_MEDIA_INFO: 'CW4973MediaInfo',
  },
};

export enum AURA_INFO {
  ADDRESS_PREFIX = 'aura',
  COIN_ID = 'aura-network',
  IMAGE = 'https://nft-ipfs.s3.amazonaws.com/assets/imgs/icons/color/aura.svg',
  NAME = 'Aura',
}

export enum LENGTH {
  CONTRACT_ADDRESS = 63,
  ACCOUNT_ADDRESS = 43,
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
    Message: 'This address has already been set name tag',
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
    Message: 'Invalid aura address format',
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
    QUEUE_NAME: 'token-price-queue',
    JOB_SYNC_TOKEN_PRICE: 'sync-token-price',
    JOB_SYNC_CW20_PRICE: 'sync-cw20-price',
  },
  CW4973: {
    QUEUE_NAME: 'cw4973',
    JOBS: {
      SYNC_ID_STATUS: 'cw4973-id-status',
      SYNC_4973_STATUS: 'cw4973-status',
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
      turned: true,
      inactiveAutoRestake: true,
    },
    nativeCoinReceived: {
      turned: true,
      inactiveAutoRestake: true,
    },
  },
};
