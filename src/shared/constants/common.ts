export const VALIDATION_PIPE_OPTIONS = { transform: true };

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
  },
};

export enum AURA_INFO {
  CONTRACT_ADDRESS = 'aura',
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
  INVALID_FORMAT: {
    Code: 'E003',
    Message: 'Invalid aura address format',
  },
  INVALID_NAME_TAG: {
    Code: 'E004',
    Message:
      'Name tag not accept special character except dot(.), dash(-), underscore(_)',
  },
};

export const PAGE_REQUEST = {
  MIN: 1,
  MAX: 100,
  MAX_200: 200,
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

export const MESSAGES = {
  ERROR: {
    NOT_PERMISSION: 'You have not permission!',
    BANNED: 'You have been banned',
    BAD_REQUEST: 'Bad request.',
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

export const REGEX_PARTERN = { NAME_TAG: new RegExp(/^[a-zA-Z0-9._-\s]+$/) };
