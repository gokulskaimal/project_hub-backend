export interface IDeleteMeetingUseCase {
  execute(roomId: string): Promise<boolean>;
}
