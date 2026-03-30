export interface IDeletePlanUseCase {
  execute(id: string, requesterId: string): Promise<boolean>;
}
