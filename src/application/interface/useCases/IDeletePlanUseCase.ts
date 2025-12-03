export interface IDeletePlanUseCase {
  execute(id: string): Promise<boolean>;
}
