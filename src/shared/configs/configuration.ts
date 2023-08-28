export default () => ({
  apiPrefix: process.env.API_PREFIX,
  port: process.env.PORT,
  startHeight: process.env.START_HEIGHT,
  deploymentDate: process.env.DEPLOYMENT_DATE || '2022-01-01T00:00:00.000Z',
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    logging: process.env.DB_LOGGING === 'true',
  },
  node: {
    rpc: process.env.RPC,
    api: process.env.API,
  },
  influxdb: {
    token: process.env.INFLUXDB_TOKEN,
    url: process.env.INFLUXDB_URL,
    bucket: process.env.INFLUXDB_BUCKET,
    org: process.env.INFLUXDB_ORG,
  },
  cacheManagement: {
    useRedis: process.env.USE_REDIS,
    ttl: process.env.TTL,
    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      db: process.env.REDIS_DB,
      db_socket: process.env.REDIS_DB_SOCKET,
      username:
        !process.env.REDIS_USERNAME || process.env.REDIS_USERNAME === 'default'
          ? ''
          : process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
      channel: process.env.REDIS_ABT_CHANNEL,
    },
  },
  indexer: {
    url: process.env.INDEXER_URL,
    chainId: process.env.INDEXER_CHAIN_ID,
  },
  indexerV2: {
    graphQL: `${process.env.INDEXER_V2_URL}${process.env.INDEXER_V2_PATH}`,
    chainDB: process.env.INDEXER_V2_DB,
    secret: process.env.INDEXER_V2_SECRET,
  },
  chainInfo: {
    coinDenom: process.env.COIN_DENOM,
    coinMinimalDenom: process.env.COIN_MINIMAL_DENOM,
    coinDecimals: Number(process.env.COIN_DECIMALS),
    precisionDiv: Math.pow(10, Number(process.env.COIN_DECIMALS)),
  },
  configUrl: process.env.CONFIG_URL,
  googleOAuth: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUrl: process.env.GOOGLE_REDIRECT_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    tokenExpiresIn: process.env.JWT_TOKEN_EXPIRES_IN,
    refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
  },
  adminInitEmail: process.env.ADMIN_INIT_EMAIL,
  mail: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    sender: process.env.EMAIL_SENDER_ADDRESS,
  },
  appDomain: process.env.APP_DOMAIN,
  bcryptSalt: process.env.BCRYPT_SALT || 8,
  auraScanUrl: process.env.AURA_SCAN_URL,
  kms: {
    kdf: process.env.KMS_KDF,
    accessKeyId: process.env.KMS_ACCESS_KEY_ID,
    secretAccessKey: process.env.KMS_SECRET_ACCESS_KEY,
    region: process.env.KMS_REGION,
    apiVersion: process.env.KMS_API_VERSION,
    alias: process.env.KMS_ALIAS,
  },
  ipfsUrl: process.env.IPFS_URL || 'https://ipfs.io/',
});
