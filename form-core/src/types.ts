export type FormValues = Record<string, unknown>;

export type Subscriber<V extends FormValues = FormValues> = (
  value: V[keyof V],
  field: keyof V,
) => void;

export type Unsubscribe = () => void;

export interface FormOptions<V extends FormValues> {
  initialValues: V;
}

export interface FormInstance<V extends FormValues> {
  /** Proxy-wrapped reactive values. Get/set triggers subscriptions. */
  values: V;
  /** Subscribe to a specific field change */
  subscribe(field: keyof V, fn: Subscriber<V>): Unsubscribe;
  /** Subscribe to any field change */
  subscribeAll(fn: Subscriber<V>): Unsubscribe;
  /** Reset all values to initialValues */
  reset(): void;
  /** Get a snapshot of current values (plain object, not proxied) */
  getValues(): V;
}
