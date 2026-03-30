export interface IDeleteSprintUseCase {
  execute(id: string, requesterId: string): Promise<boolean>;
}
