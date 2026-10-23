export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}
