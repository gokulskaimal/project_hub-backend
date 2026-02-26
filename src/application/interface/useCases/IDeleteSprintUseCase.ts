export interface IDeleteSprintUseCase {
  execute(id: string): Promise<boolean>;
}
