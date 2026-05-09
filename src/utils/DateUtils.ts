export type TimeFrame = "DAY" | "WEEK" | "MONTH" | "YEAR";

export class DateUtils {
  /**
   * Get the start date and MongoDB group format for a given timeframe.
   * @param timeFrame - The selected timeframe
   * @returns { startDate: Date, groupFormat: string }
   */
  static getTimeFrameRange(timeFrame: TimeFrame): {
    startDate: Date;
    groupFormat: string;
  } {
    const now = new Date();
    const startDate = new Date();
    let groupFormat = "%Y-%m"; // Default for Year

    switch (timeFrame) {
      case "DAY":
        startDate.setHours(now.getHours() - 24);
        groupFormat = "%Y-%m-%d %H:00";
        break;
      case "WEEK":
        startDate.setDate(now.getDate() - 7);
        groupFormat = "%Y-%m-%d";
        break;
      case "MONTH":
        startDate.setDate(now.getDate() - 30);
        groupFormat = "%Y-%m-%d";
        break;
      case "YEAR":
      default:
        startDate.setFullYear(now.getFullYear() - 1);
        groupFormat = "%Y-%m";
        break;
    }

    return { startDate, groupFormat };
  }
}
