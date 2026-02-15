import type { FieldComponentProps } from './types';

type FieldComponent = React.ComponentType<FieldComponentProps>;

const registry = new Map<string, FieldComponent>();

export function registerField(type: string, component: FieldComponent): void {
  registry.set(type, component);
}

export function getFieldComponent(type: string): FieldComponent | undefined {
  return registry.get(type);
}
