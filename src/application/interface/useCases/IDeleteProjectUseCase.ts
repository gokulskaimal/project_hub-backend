export interface IDeleteProjectUseCase {
  execute(id: string, requesterId: string): Promise<boolean>;
}
