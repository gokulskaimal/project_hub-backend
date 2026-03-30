export interface ISocketService {
  emitToUser<T>(userId: string, event: string, data: T): void;
  emitToOrganization<T>(orgId: string, event: string, data: T): void;
  emitToRoleInOrg<T>(orgId: string, role: string, event: string, data: T): void;
  emitToProject<T>(projectId: string, event: string, data: T): void;
  emitToRole<T>(role: string, event: string, data: T): void;
}
