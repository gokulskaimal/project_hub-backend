import { TimeFrame } from "../../../utils/DateUtils";

export interface IGetMemberAnalyticsUseCase {
  execute(
    userId: string,
    timeFrame?: TimeFrame,
  ): Promise<Record<string, unknown>>;
}
