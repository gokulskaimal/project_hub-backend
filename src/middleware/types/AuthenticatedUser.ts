import { UserRole } from '../../domain/enums/UserRole'

export interface AuthenticatedUser {
  id: string
  role: UserRole
}
