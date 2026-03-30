export interface IDeleteTaskUseCase {
  execute(id: string, requesterId: string): Promise<boolean>;
}
