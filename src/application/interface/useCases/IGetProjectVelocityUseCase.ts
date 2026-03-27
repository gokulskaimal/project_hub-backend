export interface IGetProjectVelocityUseCase {
  execute(
    projectId: string,
    days: number,
    requesterId: string,
  ): Promise<{
    totalPoints: number;
    start: Date;
    end: Date;
    days: number;
  }>;
}
