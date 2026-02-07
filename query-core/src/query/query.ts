import type {
  QueryOptions,
  QueryState,
  QueryStatus,
  QuerySubscriber,
  Unsubscribe,
} from '../types';

export class Query<TData = unknown, TError = Error> {
  private status: QueryStatus = 'idle';
  private data: TData | undefined = undefined;
  private error: TError | undefined = undefined;
  private dataUpdatedAt: number | undefined = undefined;
  private staleTime: number;
  private queryFn: () => Promise<TData>;
  private subscribers = new Set<QuerySubscriber<TData, TError>>();
  /** Tracks the current in-flight promise to deduplicate concurrent fetches */
  private activePromise: Promise<TData> | null = null;

  constructor(options: QueryOptions<TData>) {
    this.queryFn = options.queryFn;
    this.staleTime = options.staleTime ?? 0;
  }

  /**
   * Returns whether cached data is still within staleTime.
   */
  private getIsFresh(): boolean {
    if (this.dataUpdatedAt === undefined) return false;
    return Date.now() - this.dataUpdatedAt < this.staleTime;
  }

  /**
   * Build a snapshot of current state.
   */
  getState(): QueryState<TData, TError> {
    return {
      status: this.status,
      data: this.data,
      error: this.error,
      dataUpdatedAt: this.dataUpdatedAt,
      isFresh: this.getIsFresh(),
    };
  }

  /**
   * Transition to a new status and notify subscribers.
   */
  private transition(
    next: QueryStatus,
    patch?: { data?: TData; error?: TError },
  ) {
    this.status = next;
    if (patch?.data !== undefined) {
      this.data = patch.data;
      this.error = undefined;
      this.dataUpdatedAt = Date.now();
    }
    if (patch?.error !== undefined) {
      this.error = patch.error;
    }
    this.notify();
  }

  private notify() {
    const state = this.getState();
    this.subscribers.forEach((fn) => fn(state));
  }

  /**
   * Fetch data. Skips fetch if cache is fresh.
   * Deduplicates concurrent calls — returns the same promise if already in-flight.
   */
  async fetch(): Promise<TData> {
    // Cache hit — data is fresh, skip fetch
    if (this.status === 'success' && this.getIsFresh()) {
      return this.data as TData;
    }

    // Deduplicate — if a fetch is already in-flight, return same promise
    if (this.activePromise) {
      return this.activePromise;
    }

    // idle/success(stale)/error → loading
    this.transition('loading');

    this.activePromise = this.queryFn()
      .then((data) => {
        this.transition('success', { data });
        return data;
      })
      .catch((err: TError) => {
        this.transition('error', { error: err });
        throw err;
      })
      .finally(() => {
        this.activePromise = null;
      });

    return this.activePromise;
  }

  /**
   * Subscribe to state changes. Returns unsubscribe function.
   * Immediately calls subscriber with current state.
   */
  subscribe(fn: QuerySubscriber<TData, TError>): Unsubscribe {
    this.subscribers.add(fn);
    fn(this.getState());

    return () => {
      this.subscribers.delete(fn);
    };
  }
}
