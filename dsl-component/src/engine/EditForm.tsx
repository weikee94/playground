import { useState } from 'react';
import { SchemaForm } from './SchemaForm';
import type { DataRecord, FormSchema } from './types';

interface Props {
  schema: FormSchema;
  initialData: DataRecord;
  onSubmit: (data: Record<string, unknown>) => void;
  onDelete?: (id: number) => void;
  onCancel?: () => void;
}

export function EditForm({ schema, initialData, onSubmit, onDelete, onCancel }: Props) {
  const [resetKey, setResetKey] = useState(0);

  const handleRevert = () => {
    setResetKey((k) => k + 1);
  };

  const handleDelete = () => {
    if (!confirm('确定要删除吗？')) return;
    onDelete?.(initialData.id);
  };

  return (
    <div>
      {initialData.updatedAt && (
        <p className="text-xs text-gray-400 mb-4">
          最后修改: {new Date(initialData.updatedAt).toLocaleString('zh-CN')}
        </p>
      )}

      <SchemaForm
        key={resetKey}
        schema={schema}
        initialData={initialData}
        onSubmit={onSubmit}
        onCancel={onCancel}
        submitLabel="更新"
      />

      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={handleRevert}
          className="px-3 py-1.5 text-xs text-yellow-600 border border-yellow-300 rounded-md hover:bg-yellow-50"
        >
          还原
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            className="px-3 py-1.5 text-xs text-red-500 border border-red-300 rounded-md hover:bg-red-50"
          >
            删除
          </button>
        )}
      </div>
    </div>
  );
}
