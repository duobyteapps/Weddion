export type PaginatedResponse<T> = {
  items: T[];
  hasMore: boolean;
};

export type PaginationFetchParams = {
  page: number;
  pageSize: number;
};
