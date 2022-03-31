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
  OFFSET = 0,
}

export enum CONST_CHAR {
  PERCENT = '%',
  SECOND = 's',
}

export enum CONST_MSG_TYPE {
  MSG_VOTE = 'MsgVote'
}
