import type { DSLParser } from './DSLParser';
import type { Field, DataRecord } from './types';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  done: 'bg-green-100 text-green-800',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-orange-100 text-orange-800',
  high: 'bg-red-100 text-red-800',
};

function formatCell(item: DataRecord, field: Field): string {
  const value = item[field.name];
  if (value == null || value === '') return '-';

  if (field.type === 'select') {
    const opt = field.options?.find((o) => o.value === value);
    return opt?.label ?? String(value);
  }
  if (field.type === 'date') {
    return new Date(String(value)).toLocaleDateString('zh-CN');
  }
  return String(value);
}

interface Props {
  parser: DSLParser;
  data: DataRecord[];
  onEdit: (item: DataRecord) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (item: DataRecord) => void;
}

export function TableGenerator({ parser, data, onEdit, onDelete, onToggleStatus }: Props) {
  const columns = parser.getTableColumns();

  if (data.length === 0) {
    return <p className="text-center py-8 text-gray-400 text-sm">暂无数据</p>;
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((f) => (
              <th
                key={f.name}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {f.label}
              </th>
            ))}
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              {columns.map((field) => {
                const text = formatCell(item, field);
                const colorMap =
                  field.name === 'status'
                    ? STATUS_COLORS
                    : field.name === 'priority'
                      ? PRIORITY_COLORS
                      : null;
                const badgeClass = colorMap?.[String(item[field.name])];

                return (
                  <td key={field.name} className="px-4 py-3 text-sm whitespace-nowrap">
                    {badgeClass ? (
                      <span className={`px-2 py-0.5 rounded text-xs ${badgeClass}`}>
                        {text}
                      </span>
                    ) : (
                      text
                    )}
                  </td>
                );
              })}
              <td className="px-4 py-3 text-right text-sm whitespace-nowrap">
                <div className="flex gap-3 justify-end">
                  {item.status !== 'done' && (
                    <button
                      onClick={() => onToggleStatus(item)}
                      className="text-green-600 hover:text-green-800"
                      title="标记完成"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    onClick={() => onEdit(item)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    删除
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
