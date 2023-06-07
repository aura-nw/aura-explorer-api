export const VALIDATION_PIPE_OPTIONS = { transform: true };

export const REQUEST_ID_TOKEN_HEADER = 'x-request-id';

export const FORWARDED_FOR_TOKEN_HEADER = 'x-forwarded-for';

export enum LINK_API {
  STAKING_POOL = 'cosmos/staking/v1beta1/pool',
  INFLATION = `cosmos/mint/v1beta1/inflation`,
  COMMUNITY_POOL = `cosmos/distribution/v1beta1/community_pool`,
  VALIDATOR = `cosmos/staking/v1beta1/validators`,
  SLASHING_PARAM = `cosmos/slashing/v1beta1/params`,
  SIGNING_INFOS = `cosmos/slashing/v1beta1/signing_infos`,
  PARAM_TALLYING = 'cosmos/gov/v1beta1/params/tallying',
  PROPOSAL_DETAIL = 'cosmos/gov/v1beta1/proposals/',
  PROPOSALS = 'cosmos/gov/v1beta1/proposals',
  LATEST_BLOCK = 'blocks/latest',
}

export enum CONST_NUM {
  LIMIT_2 = 2,
  LIMIT_100 = 100,
  LIMIT_50 = 50,
  OFFSET = 0,
}

export enum CONST_CHAR {
  PERCENT = '%',
  SECOND = 's',
  DELEGATE = 'delegate',
  UNBOND = 'unbond',
  VALIDATOR = 'validator',
  SOURCE_VALIDATOR = 'source_validator',
  AMOUNT = 'amount',
  UNDEFINED = 'undefined',
  MESSAGE = 'message',
  ACTION = 'action',
  REDELEGATE = 'redelegate',
  CREATE_VALIDATOR = 'create_validator',
}

export enum CONST_MSG_TYPE {
  MSG_VOTE = 'MsgVote',
  MSG_SUBMIT_PROPOSAL = 'MsgSubmitProposal',
  MSG_DEPOSIT = 'MsgDeposit',
  MSG_DELEGATE = 'MsgDelegate',
  MSG_UNDELEGATE = 'MsgUndelegate',
  MSG_REDELEGATE = 'MsgBeginRedelegate',
  MSG_WITHDRAW_DELEGATOR_REWARD = 'MsgWithdrawDelegatorReward',
}

export enum CONST_FULL_MSG_TYPE {
  MSG_DELEGATE = '/cosmos.staking.v1beta1.MsgDelegate',
  MSG_REDELEGATE = '/cosmos.staking.v1beta1.MsgBeginRedelegate',
  MSG_UNDELEGATE = '/cosmos.staking.v1beta1.MsgUndelegate',
  MSG_CREATE_VALIDATOR = '/cosmos.staking.v1beta1.MsgCreateValidator',
}

export enum CONST_PROPOSAL_TYPE {
  SOFTWARE_UPGRADE_PROPOSAL = 'SoftwareUpgradeProposal',
  COMMUNITY_POOL_SPEND_PROPOSAL = 'CommunityPoolSpendProposal',
  PARAMETER_CHANGE_PROPOSAL = 'ParameterChangeProposal',
}

export enum CONST_PROPOSAL_VOTE_OPTION {
  YES = 'VOTE_OPTION_YES',
  ABSTAIN = 'VOTE_OPTION_ABSTAIN',
  NO = 'VOTE_OPTION_NO',
  NO_WITH_VETO = 'VOTE_OPTION_NO_WITH_VETO',
}

export enum CONST_DELEGATE_TYPE {
  DELEGATE = 'Delegate',
  UNDELEGATE = 'Undelegate',
  REDELEGATE = 'Redelegate',
}

export enum CONTRACT_STATUS {
  EXACT_MATCH = 'EXACT MATCH',
  SIMILAR_MATCH = 'SIMILAR MATCH',
  UNVERIFIED = 'UNVERIFIED',
  VERIFYFAIL = 'VERIFYFAIL',
  VERIFYING = 'VERIFYING',
  NOT_REGISTERED = 'Not registered',
  TBD = 'TBD',
  DEPLOYED = 'Deployed',
  REJECTED = 'Rejected',
  APPROVED = 'Approved',
  PENDING = 'Pending',
}

export enum CONTRACT_TRANSACTION_LABEL {
  IN = 'IN',
  OUT = 'OUT',
  CREATION = 'CREATION',
}

export enum CONTRACT_TRANSACTION_TYPE {
  INSTANTIATE = '/cosmwasm.wasm.v1.MsgInstantiateContract',
  EXECUTE = '/cosmwasm.wasm.v1.MsgExecuteContract',
  SEND = '/cosmos.bank.v1beta1.MsgSend',
}

export enum SYNC_CONTRACT_TRANSACTION_TYPE {
  INSTANTIATE = 'MsgInstantiateContract',
  EXECUTE = 'MsgExecuteContract',
  SEND = 'MsgSend',
}

export enum CONTRACT_TRANSACTION_EXECUTE_TYPE {
  MINT = 'mint',
  BURN = 'burn',
}

export enum CONTRACT_TYPE {
  CW20 = 'CW20',
  CW721 = 'CW721',
  CW4973 = 'CW4973',
}

export enum CONTRACT_CODE_RESULT {
  TBD = 'TBD',
  CORRECT = 'Correct',
  INCORRECT = 'Incorrect',
}

export enum INDEXER_API {
  STATUS = 'api/v1/network/status?chainid=%s',
  REGISTER_CODE_ID = 'api/v1/asset/index',
  ACCOUNT_DELEGATIONS = 'api/v1/account-info/delegations?address=%s&chainId=%s',
  GET_TOKENS_BY_OWNER = 'api/v1/asset/getByOwner?owner=%s&chainid=%s&countTotal=false',
  TOKEN_HOLDERS = 'api/v1/asset/holder?chainid=%s&contractType=%s&contractAddress=%s&countTotal=true',
  GET_NFT_BY_CONTRACT_ADDRESS_AND_TOKEN_ID = 'api/v1/asset/getByOwner?chainid=%s&contractType=%s&tokenId=%s&contractAddress=%s',
  GET_NFTS_BY_OWNER = 'api/v1/asset/getByOwner?owner=%s&chainid=%s&contractType=%s&isBurned=false&countTotal=true&pageLimit=%s',
  GET_PROPOSAL = 'api/v1/proposal?chainid=%s&pageLimit=%s&pageOffset=%s&reverse=true',
  GET_CW20_TOKENS_BY_OWNER = 'api/v1/asset/getByOwner?owner=%s&chainid=%s&contractType=CW20&countTotal=true&pageLimit=%s&pageOffset=%s',
  GET_HOLDER_INFO_CW20 = 'api/v1/daily-cw20-holder',
  GET_VALIDATOR_BY_ADDRESS = 'api/v1/validator?chainid=%s&operatorAddress=%s&pageLimit=1&pageOffset=0',
}

export const INDEXER_API_V2 = {
  GRAPH_QL: {
    PROPOSAL_COUNT: `query CountProposal { %s { proposal_aggregate { aggregate { count } } } }`,
    ACCOUNT: `query Account($address: String) { %s { account(where: {address: {_eq: $address}}) { %s } } }`,
    CONTRACT_CODE_LIST: `query ContractCode($where: auratestnet_code_bool_exp, $limit: Int, $offset: Int) { %s { code(where: $where, order_by: {code_id: desc}, limit: $limit, offset: $offset) { %s } code_aggregate(where: $where) { aggregate { count } } } }`,
    CONTRACT_CODE_DETAIL: `query ContractCodeDetail($where: auratestnet_code_bool_exp) { %s { code(where: $where) { %s } } }`,
  },
};

export enum AURA_INFO {
  CONTRACT_ADDRESS = 'aura',
  COIN_ID = 'aura-network',
  IMAGE = 'https://nft-ipfs.s3.amazonaws.com/assets/imgs/icons/color/aura.svg',
  NAME = 'Aura',
}

export enum SEARCH_KEYWORD {
  CONTRACT_ADDRESS = 'contractAddress',
  TOKEN_ID = 'tokenId',
  NEXT_KEY = 'nextKey',
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
};

export const PAGE_REQUEST = {
  MIN: 1,
  MAX: 100,
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
}

export enum NAME_TAG_TYPE {
  ACCOUNT = 'account',
  CONTRACT = 'contract',
}
