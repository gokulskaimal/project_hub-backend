export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
  pagination?: {
    total: number;
    limit: number;
    page: number;
    pages: number;
  };
}
