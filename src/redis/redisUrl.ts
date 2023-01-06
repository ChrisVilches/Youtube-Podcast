export const redisUrl = (): string => {
  const host = process.env.REDIS_HOST as string
  const port = process.env.REDIS_PORT as string
  const user = process.env.REDIS_USER as string
  const pass = process.env.REDIS_PASS as string
  const dbNum = process.env.REDIS_DB_NUMBER as string

  return `redis://${user}:${pass}@${host}:${port}/${dbNum}`
}
