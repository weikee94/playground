import type { FormValues, FormOptions, FormInstance, Subscriber } from '../types';

export function createForm<V extends FormValues>(
  options: FormOptions<V>,
): FormInstance<V> {
  const { initialValues } = options;

  // Internal state — plain object copy
  let state: V = { ...initialValues };

  // Subscribers per field
  const fieldSubs = new Map<keyof V, Set<Subscriber<V>>>();

  // Wildcard subscribers (subscribeAll)
  const allSubs = new Set<Subscriber<V>>();

  function notify(field: keyof V, value: V[keyof V]) {
    const subs = fieldSubs.get(field);
    if (subs) {
      subs.forEach((fn) => fn(value, field));
    }
    allSubs.forEach((fn) => fn(value, field));
  }

  // Proxy that intercepts get/set on values
  const values = new Proxy(state, {
    get(_target, prop: string) {
      return state[prop as keyof V];
    },
    set(_target, prop: string, newValue: unknown) {
      const field = prop as keyof V;
      const oldValue = state[field];
      if (Object.is(oldValue, newValue)) return true;

      state[field] = newValue as V[keyof V];
      notify(field, newValue as V[keyof V]);
      return true;
    },
  }) as V;

  function subscribe(field: keyof V, fn: Subscriber<V>) {
    if (!fieldSubs.has(field)) {
      fieldSubs.set(field, new Set());
    }
    fieldSubs.get(field)!.add(fn);

    return () => {
      fieldSubs.get(field)?.delete(fn);
    };
  }

  function subscribeAll(fn: Subscriber<V>) {
    allSubs.add(fn);
    return () => {
      allSubs.delete(fn);
    };
  }

  function reset() {
    const fields = new Set([
      ...Object.keys(state),
      ...Object.keys(initialValues),
    ]);
    state = { ...initialValues };

    // Notify all changed fields
    fields.forEach((field) => {
      notify(field as keyof V, state[field as keyof V]);
    });
  }

  function getValues(): V {
    return { ...state };
  }

  return {
    values,
    subscribe,
    subscribeAll,
    reset,
    getValues,
  };
}
