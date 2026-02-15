import { getFieldComponent } from './FieldRegistry';
import type { FieldComponentProps } from './types';

export function DynamicField(props: FieldComponentProps) {
  const Component = getFieldComponent(props.field.type);

  if (!Component) {
    return (
      <div className="text-red-500 text-sm">
        未知字段类型: {props.field.type}
      </div>
    );
  }

  return <Component {...props} />;
}
