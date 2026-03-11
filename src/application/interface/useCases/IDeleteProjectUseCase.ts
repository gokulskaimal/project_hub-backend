export interface IDeleteProjectUseCase {
  execute(id: string): Promise<boolean>;
}
