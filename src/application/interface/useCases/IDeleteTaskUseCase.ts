export interface IDeleteTaskUseCase {
  execute(id: string): Promise<boolean>;
}
