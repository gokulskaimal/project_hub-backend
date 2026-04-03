import { TimeFrame } from "../../../utils/DateUtils";

export interface IGetManagerAnalyticsUseCase {
  execute(
    ordId: string,
    timeFrame?: TimeFrame,
  ): Promise<Record<string, unknown>>;
}
