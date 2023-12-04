export enum TRANSACTION_TYPE_ENUM {
  IBCTransfer = '/ibc.applications.transfer.v1.MsgTransfer',
  IBCReceived = '/ibc.core.channel.v1.MsgRecvPacket',
  IBCAcknowledgement = '/ibc.core.channel.v1.MsgAcknowledgement',
  IBCUpdateClient = '/ibc.core.client.v1.MsgUpdateClient',
  IBCTimeout = '/ibc.core.channel.v1.MsgTimeout',
  IBCChannelOpenInit = '/ibc.core.channel.v1.MsgChannelOpenInit',
  IBCConnectionOpenInit = '/ibc.core.connection.v1.MsgConnectionOpenInit',
  IBCCreateClient = '/ibc.core.client.v1.MsgCreateClient',
  IBCChannelOpenAck = '/ibc.core.channel.v1.MsgChannelOpenAck',
  IBCMsgConnectionOpenTry = '/ibc.core.connection.v1.MsgConnectionOpenTry',
  Send = '/cosmos.bank.v1beta1.MsgSend',
  MultiSend = '/cosmos.bank.v1beta1.MsgMultiSend',
  Delegate = '/cosmos.staking.v1beta1.MsgDelegate',
  Undelegate = '/cosmos.staking.v1beta1.MsgUndelegate',
  Redelegate = '/cosmos.staking.v1beta1.MsgBeginRedelegate',
  GetReward = '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
  SwapWithinBatch = '/tendermint.liquidity.v1beta1.MsgSwapWithinBatch',
  DepositWithinBatch = '/tendermint.liquidity.v1beta1.MsgDepositWithinBatch',
  EditValidator = '/cosmos.staking.v1beta1.MsgEditValidator',
  CreateValidator = '/cosmos.staking.v1beta1.MsgCreateValidator',
  Unjail = '/cosmos.slashing.v1beta1.MsgUnjail',
  StoreCode = '/cosmwasm.wasm.v1.MsgStoreCode',
  InstantiateContract = '/cosmwasm.wasm.v1.MsgInstantiateContract',
  InstantiateContract2 = '/cosmwasm.wasm.v1.MsgInstantiateContract2',
  ExecuteContract = '/cosmwasm.wasm.v1.MsgExecuteContract',
  ModifyWithdrawAddress = '/cosmos.distribution.v1beta1.MsgSetWithdrawAddress',
  JoinPool = '/osmosis.gamm.v1beta1.MsgJoinPool',
  LockTokens = '/osmosis.lockup.MsgLockTokens',
  JoinSwapExternAmountIn = '/osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn',
  SwapExactAmountIn = '/osmosis.gamm.v1beta1.MsgSwapExactAmountIn',
  BeginUnlocking = '/osmosis.lockup.MsgBeginUnlocking',
  Vote = '/cosmos.gov.v1beta1.MsgVote',
  VoteV2 = '/cosmos.gov.v1.MsgVote',
  Vesting = '/cosmos.vesting.v1beta1.MsgCreateVestingAccount',
  Deposit = '/cosmos.gov.v1beta1.MsgDeposit',
  DepositV2 = '/cosmos.gov.v1.MsgDeposit',
  SubmitProposalTx = '/cosmos.gov.v1beta1.MsgSubmitProposal',
  SubmitProposalTxV2 = '/cosmos.gov.v1.MsgSubmitProposal',
  GetRewardCommission = '/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission',
  PeriodicVestingAccount = '/cosmos.vesting.v1beta1.MsgCreatePeriodicVestingAccount',
  BasicAllowance = '/cosmos.feegrant.v1beta1.BasicAllowance',
  PeriodicAllowance = '/cosmos.feegrant.v1beta1.PeriodicAllowance',
  MsgGrantAllowance = '/cosmos.feegrant.v1beta1.MsgGrantAllowance',
  MsgRevokeAllowance = '/cosmos.feegrant.v1beta1.MsgRevokeAllowance',
  AllowedMsgAllowance = '/cosmos.feegrant.v1beta1.AllowedMsgAllowance',
  AllowedContractAllowance = '/cosmos.feegrant.v1beta1.AllowedContractAllowance',
  GrantAuthz = '/cosmos.authz.v1beta1.MsgGrant',
  ExecuteAuthz = '/cosmos.authz.v1beta1.MsgExec',
  RevokeAuthz = '/cosmos.authz.v1beta1.MsgRevoke',
  MsgMigrateContract = '/cosmwasm.wasm.v1.MsgMigrateContract',
  Fail = 'FAILED',
}

export enum TypeTransaction {
  IBCTransfer = 'IBC Transfer',
  IBCReceived = 'IBC Received',
  IBCAcknowledgement = 'IBC Acknowledgement',
  IBCUpdateClient = 'IBC Update Client',
  IBCTimeout = 'IBC Timeout',
  IBCChannelOpenInit = 'IBC Channel Open Init',
  IBCConnectionOpenInit = 'IBC Connect Open Init',
  IBCCreateClient = 'IBC Create Client',
  IBCChannelOpenAck = 'IBC Channel Open Ack',
  IBCMsgConnectionOpenTry = 'Connection Open Try',
  Send = 'Send',
  Received = 'Receive',
  MultiSend = 'Multisend',
  Delegate = 'Delegate',
  Undelegate = 'Undelegate',
  Redelegate = 'Redelegate',
  GetReward = 'Get Reward',
  SwapWithinBatch = 'Swap Within Batch',
  DepositWithinBatch = 'Deposit Within Batch',
  EditValidator = 'Edit Validator',
  CreateValidator = 'Create Validator',
  Unjail = 'Unjail',
  StoreCode = 'Store Code',
  InstantiateContract = 'Instantiate Contract',
  ExecuteContract = 'Execute Contract',
  ModifyWithdrawAddress = 'Set Withdraw Address',
  JoinPool = 'Join pool',
  LockTokens = 'Lock Tokens (Start Farming)',
  JoinSwapExternAmountIn = 'Join Swap Extern Amount In',
  SwapExactAmountIn = 'Swap Exact Amount In',
  BeginUnlocking = 'Begin Unlocking',
  Vote = 'Vote',
  Vesting = 'Vesting',
  Deposit = 'Deposit',
  SubmitProposalTx = 'Submit Proposal',
  GetRewardCommission = 'Withdraw Validator Commission',
  PeriodicVestingAccount = 'Periodic Vesting',
  BasicAllowance = 'Basic',
  PeriodicAllowance = 'Periodic',
  MsgGrantAllowance = 'Grant Allowance',
  MsgRevokeAllowance = 'Revoke Allowance',
  GrantAuthz = 'Grant Authz',
  ExecuteAuthz = 'Execute Authz',
  RevokeAuthz = 'Revoke Authz',
  MsgMigrateContract = 'Migrate Contract',
  Fail = 'Fail',
}

export enum StatusTransaction {
  Success = 'Success',
  Fail = 'Fail',
}

export enum CodeTransaction {
  Success = 0,
}

export enum TYPE_EXPORT {
  ExecutedTxs = 'executed',
  AuraTxs = 'coin-transfer',
  FtsTxs = 'token-transfer',
  NftTxs = 'nft-transfer',
}

export enum RANGE_EXPORT {
  Date = 'date',
  Height = 'height',
}

export const TYPE_TRANSACTION = [
  {
    label: TRANSACTION_TYPE_ENUM.IBCTransfer,
    value: TypeTransaction.IBCTransfer,
  },
  {
    label: TRANSACTION_TYPE_ENUM.IBCReceived,
    value: TypeTransaction.IBCReceived,
  },
  {
    label: TRANSACTION_TYPE_ENUM.IBCAcknowledgement,
    value: TypeTransaction.IBCAcknowledgement,
  },
  {
    label: TRANSACTION_TYPE_ENUM.IBCUpdateClient,
    value: TypeTransaction.IBCUpdateClient,
  },
  {
    label: TRANSACTION_TYPE_ENUM.IBCTimeout,
    value: TypeTransaction.IBCTimeout,
  },
  {
    label: TRANSACTION_TYPE_ENUM.IBCChannelOpenInit,
    value: TypeTransaction.IBCChannelOpenInit,
  },
  {
    label: TRANSACTION_TYPE_ENUM.IBCConnectionOpenInit,
    value: TypeTransaction.IBCConnectionOpenInit,
  },
  {
    label: TRANSACTION_TYPE_ENUM.IBCCreateClient,
    value: TypeTransaction.IBCCreateClient,
  },
  {
    label: TRANSACTION_TYPE_ENUM.IBCChannelOpenAck,
    value: TypeTransaction.IBCChannelOpenAck,
  },
  {
    label: TRANSACTION_TYPE_ENUM.IBCMsgConnectionOpenTry,
    value: TypeTransaction.IBCMsgConnectionOpenTry,
  },
  { label: TRANSACTION_TYPE_ENUM.Send, value: TypeTransaction.Send },
  { label: TRANSACTION_TYPE_ENUM.MultiSend, value: TypeTransaction.MultiSend },
  { label: TRANSACTION_TYPE_ENUM.Delegate, value: TypeTransaction.Delegate },
  {
    label: TRANSACTION_TYPE_ENUM.Undelegate,
    value: TypeTransaction.Undelegate,
  },
  {
    label: TRANSACTION_TYPE_ENUM.Redelegate,
    value: TypeTransaction.Redelegate,
  },
  { label: TRANSACTION_TYPE_ENUM.GetReward, value: TypeTransaction.GetReward },
  {
    label: TRANSACTION_TYPE_ENUM.SwapWithinBatch,
    value: TypeTransaction.SwapWithinBatch,
  },
  {
    label: TRANSACTION_TYPE_ENUM.DepositWithinBatch,
    value: TypeTransaction.DepositWithinBatch,
  },
  {
    label: TRANSACTION_TYPE_ENUM.EditValidator,
    value: TypeTransaction.EditValidator,
  },
  {
    label: TRANSACTION_TYPE_ENUM.CreateValidator,
    value: TypeTransaction.CreateValidator,
  },
  { label: TRANSACTION_TYPE_ENUM.Unjail, value: TypeTransaction.Unjail },
  { label: TRANSACTION_TYPE_ENUM.StoreCode, value: TypeTransaction.StoreCode },
  {
    label: TRANSACTION_TYPE_ENUM.InstantiateContract,
    value: TypeTransaction.InstantiateContract,
  },
  {
    label: TRANSACTION_TYPE_ENUM.InstantiateContract2,
    value: TypeTransaction.InstantiateContract,
  },
  {
    label: TRANSACTION_TYPE_ENUM.ExecuteContract,
    value: TypeTransaction.ExecuteContract,
  },
  {
    label: TRANSACTION_TYPE_ENUM.ModifyWithdrawAddress,
    value: TypeTransaction.ModifyWithdrawAddress,
  },
  { label: TRANSACTION_TYPE_ENUM.JoinPool, value: TypeTransaction.JoinPool },
  {
    label: TRANSACTION_TYPE_ENUM.LockTokens,
    value: TypeTransaction.LockTokens,
  },
  {
    label: TRANSACTION_TYPE_ENUM.JoinSwapExternAmountIn,
    value: TypeTransaction.JoinSwapExternAmountIn,
  },
  {
    label: TRANSACTION_TYPE_ENUM.SwapExactAmountIn,
    value: TypeTransaction.SwapExactAmountIn,
  },
  {
    label: TRANSACTION_TYPE_ENUM.BeginUnlocking,
    value: TypeTransaction.BeginUnlocking,
  },
  { label: TRANSACTION_TYPE_ENUM.Vote, value: TypeTransaction.Vote },
  { label: TRANSACTION_TYPE_ENUM.VoteV2, value: TypeTransaction.Vote },
  { label: TRANSACTION_TYPE_ENUM.Vesting, value: TypeTransaction.Vesting },
  { label: TRANSACTION_TYPE_ENUM.Deposit, value: TypeTransaction.Deposit },
  { label: TRANSACTION_TYPE_ENUM.DepositV2, value: TypeTransaction.Deposit },
  {
    label: TRANSACTION_TYPE_ENUM.SubmitProposalTx,
    value: TypeTransaction.SubmitProposalTx,
  },
  {
    label: TRANSACTION_TYPE_ENUM.SubmitProposalTxV2,
    value: TypeTransaction.SubmitProposalTx,
  },
  {
    label: TRANSACTION_TYPE_ENUM.GetRewardCommission,
    value: TypeTransaction.GetRewardCommission,
  },
  {
    label: TRANSACTION_TYPE_ENUM.PeriodicVestingAccount,
    value: TypeTransaction.PeriodicVestingAccount,
  },
  {
    label: TRANSACTION_TYPE_ENUM.BasicAllowance,
    value: TypeTransaction.BasicAllowance,
  },
  {
    label: TRANSACTION_TYPE_ENUM.PeriodicAllowance,
    value: TypeTransaction.PeriodicAllowance,
  },
  {
    label: TRANSACTION_TYPE_ENUM.MsgGrantAllowance,
    value: TypeTransaction.MsgGrantAllowance,
  },
  {
    label: TRANSACTION_TYPE_ENUM.MsgRevokeAllowance,
    value: TypeTransaction.MsgRevokeAllowance,
  },
  {
    label: TRANSACTION_TYPE_ENUM.GrantAuthz,
    value: TypeTransaction.GrantAuthz,
  },
  {
    label: TRANSACTION_TYPE_ENUM.ExecuteAuthz,
    value: TypeTransaction.ExecuteAuthz,
  },
  {
    label: TRANSACTION_TYPE_ENUM.RevokeAuthz,
    value: TypeTransaction.RevokeAuthz,
  },
  {
    label: TRANSACTION_TYPE_ENUM.MsgMigrateContract,
    value: TypeTransaction.MsgMigrateContract,
  },
  { label: TRANSACTION_TYPE_ENUM.Fail, value: TypeTransaction.Fail },
];

export const NULL_ADDRESS = 'Null address';
