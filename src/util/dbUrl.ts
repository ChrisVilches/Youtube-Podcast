export const dbUrl = (scheme: string, prefix: string): string => {
  const host = process.env[`${prefix}_HOST`] as string
  const port = process.env[`${prefix}_PORT`] as string
  const user = process.env[`${prefix}_USER`] as string
  const pass = process.env[`${prefix}_PASS`] as string
  const db = process.env[`${prefix}_DB`] as string

  const userInfo = user.length > 0 && pass.length > 0 ? `${user}:${pass}@` : ''

  return `${scheme}://${userInfo}${host}:${port}/${db}`
}
