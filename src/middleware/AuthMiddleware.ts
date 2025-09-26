import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AuthenticatedRequest } from './types/AuthenticatedRequest'
import { AuthenticatedUser } from './types/AuthenticatedUser'

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(' ')[1]

  if (!token) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as AuthenticatedUser
    req.user = payload
    next()
  } catch (error: any) {
    res.status(401).json({ error: error.message })
  }
}
