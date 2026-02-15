import type { DataRecord, FieldConfig, FormSchema } from './types';

function formatValue(field: FieldConfig, value: unknown): React.ReactNode {
  if (value == null || value === '') return <span className="text-gray-400">-</span>;

  switch (field.type) {
    case 'password':
      return '••••••';

    case 'email':
      return (
        <a href={`mailto:${value}`} className="text-blue-500 hover:underline">
          {String(value)}
        </a>
      );

    case 'date':
      return new Date(String(value)).toLocaleDateString('zh-CN');

    case 'select':
    case 'radio': {
      const opt = field.options?.find((o) => o.value === value);
      return opt?.label ?? String(value);
    }

    case 'checkbox': {
      if (!Array.isArray(value)) return String(value);
      return (value as string[])
        .map((v) => {
          const opt = field.options?.find((o) => o.value === v);
          return opt?.label ?? v;
        })
        .join('、');
    }

    case 'image-upload': {
      if (typeof value !== 'string' || !value) return '-';
      return (
        <img
          src={value}
          alt={field.label}
          className="w-24 h-24 object-cover rounded border border-gray-200"
        />
      );
    }

    default:
      return String(value);
  }
}

interface Props {
  schema: FormSchema;
  data: DataRecord;
  onEdit?: () => void;
  onClose?: () => void;
}

export function DetailPanel({ schema, data, onEdit, onClose }: Props) {
  const isGrid = schema.layout?.type === 'grid';
  const columns = schema.layout?.columns ?? 2;

  return (
    <div className="space-y-6">
      <div
        className={isGrid ? 'grid gap-4' : 'space-y-4'}
        style={isGrid ? { gridTemplateColumns: `repeat(${columns}, 1fr)` } : undefined}
      >
        {schema.fields.map((field) => (
          <div
            key={field.name}
            style={isGrid && field.gridColumn ? { gridColumn: `span ${field.gridColumn}` } : undefined}
          >
            <dt className="text-xs text-gray-500 mb-1">{field.label}</dt>
            <dd className="text-sm text-gray-900">{formatValue(field, data[field.name])}</dd>
          </div>
        ))}
      </div>

      {(data.createdAt || data.updatedAt) && (
        <div className="text-xs text-gray-400 pt-4 border-t border-gray-100 space-y-1">
          {data.createdAt && (
            <div>创建时间: {new Date(data.createdAt).toLocaleString('zh-CN')}</div>
          )}
          {data.updatedAt && (
            <div>更新时间: {new Date(data.updatedAt).toLocaleString('zh-CN')}</div>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
          >
            编辑
          </button>
        )}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
          >
            关闭
          </button>
        )}
      </div>
    </div>
  );
}
