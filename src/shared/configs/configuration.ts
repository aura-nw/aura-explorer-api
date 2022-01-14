export default (): any => ({
  apiPrefix: process.env.API_PREFIX,
  port: process.env.PORT,
  startHeight: process.env.START_HEIGHT,
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
  },
  node: {
    rpc: process.env.RPC,
  },
});
