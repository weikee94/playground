export type QueryStatus = 'idle' | 'loading' | 'success' | 'error';

export interface QueryState<TData = unknown, TError = Error> {
  status: QueryStatus;
  data: TData | undefined;
  error: TError | undefined;
  /** Timestamp (ms) when data was last fetched successfully */
  dataUpdatedAt: number | undefined;
  /** Whether cached data is still within staleTime */
  isFresh: boolean;
}

export interface QueryOptions<TData = unknown> {
  /** Async function that fetches data */
  queryFn: () => Promise<TData>;
  /** Time in ms that data is considered fresh. Default: 0 (always stale) */
  staleTime?: number;
}

export type QuerySubscriber<TData = unknown, TError = Error> = (
  state: QueryState<TData, TError>,
) => void;

export type Unsubscribe = () => void;
