import { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'

export const errorHandler = (err: createError.HttpError, _req: Request, res: Response, _next: NextFunction): void => {
  err.status ??= 500
  const errorMessage = err.status < 500 ? err : {}

  if (err.status >= 500) {
    console.error(err)
  }

  res.status(err.status)
  res.json(errorMessage)
}
