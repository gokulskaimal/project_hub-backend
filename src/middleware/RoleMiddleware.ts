// c:\Users\gokul\Documents\BroToType\Project Hub\server\src\middleware\RoleMiddleware.ts
import { Response, NextFunction } from 'express'
import { UserRole } from '../domain/enums/UserRole'
import { AuthenticatedRequest } from './types/AuthenticatedRequest'

export function roleMiddleware(requiredRoles: UserRole | UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const currentUser = req.user
    if (!currentUser) {
      res.status(403).json({ error: 'Forbidden' })
      return
    }

    const allowedRoles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
    if (!allowedRoles.includes(currentUser.role)) {
      res.status(403).json({ error: 'Forbidden' })
      return
    }

    next()
  }
}
