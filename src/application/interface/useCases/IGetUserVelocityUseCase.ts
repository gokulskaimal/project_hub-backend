export interface IGetUserVelocityUseCase {
  execute(
    userId: string,
    days: number,
    requesterId: string,
  ): Promise<{
    totalPoints: number;
    start: Date;
    end: Date;
    days: number;
  }>;
}
