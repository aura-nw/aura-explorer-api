export const VALIDATION_PIPE_OPTIONS = { transform: true };

export const REQUEST_ID_TOKEN_HEADER = 'x-request-id';

export const FORWARDED_FOR_TOKEN_HEADER = 'x-forwarded-for';

export enum LINK_API {
    STAKING_POOL = '/cosmos/staking/v1beta1/pool',
    INFLATION = `/cosmos/mint/v1beta1/inflation`,
    COMMUNITY_POOL = `/cosmos/distribution/v1beta1/community_pool`,
    VALIDATOR = `/cosmos/staking/v1beta1/validators`,
    SLASHING_PARAM = `/cosmos/slashing/v1beta1/params`,
    SIGNING_INFOS = `/cosmos/slashing/v1beta1/signing_infos`,
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
  UAURA  = 'uaura',
  DELEGATE  = 'delegate',
  UNBOND = 'unbond',
  VALIDATOR = 'validator',
  AMOUNT = 'amount',
  UNDEFINED = 'undefined',
  MESSAGE = 'message',
  ACTION = 'action',
}

export enum CONST_MSG_TYPE {
  MSG_VOTE = 'MsgVote',
  MSG_SUBMIT_PROPOSAL = 'MsgSubmitProposal',
  MSG_DEPOSIT = 'MsgDeposit'
}

export enum CONST_PROPOSAL_TYPE {
  SOFTWARE_UPGRADE_PROPOSAL = 'SoftwareUpgradeProposal',
  COMMUNITY_POOL_SPEND_PROPOSAL = 'CommunityPoolSpendProposal',
  PARAMETER_CHANGE_PROPOSAL = 'ParameterChangeProposal'
}

export enum CONST_NAME_ASSETS {
  AURA = 'AURA'
}

export enum CONST_PUBKEY_ADDR {
  AURAVALCONS = 'auravalcons',
  AURA = 'aura',
}
