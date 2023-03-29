export default () => ({
  apiPrefix: process.env.API_PREFIX,
  port: process.env.PORT,
  startHeight: process.env.START_HEIGHT,
  cosmosScanAPI: process.env.COSMOS_SCAN_API,
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
      username:
        !process.env.REDIS_USERNAME || process.env.REDIS_USERNAME === 'default'
          ? ''
          : process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
    },
  },
  threads: process.env.THREADS,
  indexer: {
    url: process.env.INDEXER_URL,
    chainId: process.env.INDEXER_CHAIN_ID,
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
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
});
