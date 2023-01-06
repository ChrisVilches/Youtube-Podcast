import { NextFunction, Request, Response } from 'express'

export const error = (err: any, _req: Request, res: Response, _next: NextFunction): void => {
  err.status ??= 500
  const errorMessage = err.status < 500 ? err : {}

  res.status(err.status)
  res.send(errorMessage)
}
