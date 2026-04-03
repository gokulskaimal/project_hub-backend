import { TimeFrame } from "../../../utils/DateUtils";

export interface IGetAdminAnalyticsUseCase {
  execute(timeFrame?: TimeFrame): Promise<Record<string, unknown>>;
}
