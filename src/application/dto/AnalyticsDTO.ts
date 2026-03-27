export interface VelocityDTO {
  totalPoints: number;
  days: number;
  start: string;
  end: string;
}

export function toVelocityDTO(data: {
  totalPoints: number;
  days: number;
  start: Date;
  end: Date;
}): VelocityDTO {
  return {
    totalPoints: data.totalPoints,
    days: data.days,
    start: data.start.toISOString(),
    end: data.end.toISOString(),
  };
}
