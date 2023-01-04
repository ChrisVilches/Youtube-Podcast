import { Request, Response } from 'express'

export const homeController = (_req: Request, res: Response): void => {
  res.json({
    port: process.env.PORT,
    env: process.env.NODE_ENV
  })
}
