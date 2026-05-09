import { TimeFrame } from "../../../utils/DateUtils";
import {
  PerformanceMetric,
  StatusDistributionItem,
  MonthlyVelocityItem,
  ProjectHealthItem,
  MemberWorkloadItem,
} from "../repositories/IAnalyticsRepo";

export interface ManagerAnalyticsResponse {
  performance: PerformanceMetric[];
  tasks: StatusDistributionItem[];
  projects: StatusDistributionItem[];
  velocity: MonthlyVelocityItem[];
  health: ProjectHealthItem[];
  workload: MemberWorkloadItem[];
}

export interface IGetManagerAnalyticsUseCase {
  execute(
    ordId: string,
    timeFrame?: TimeFrame,
  ): Promise<ManagerAnalyticsResponse>;
}
