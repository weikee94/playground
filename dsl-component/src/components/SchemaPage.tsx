import { useEffect, useMemo, useState } from 'react';
import { StorageAdapter } from '../engine/StorageAdapter';
import { CreateForm } from '../engine/CreateForm';
import { EditForm } from '../engine/EditForm';
import { DetailPanel } from '../engine/DetailPanel';
import { Modal } from './Modal';
import type { DataRecord, FormSchema } from '../engine/types';

type ViewMode =
  | { type: 'list' }
  | { type: 'create' }
  | { type: 'detail'; item: DataRecord }
  | { type: 'edit'; item: DataRecord };

interface Props {
  schema: FormSchema;
}

export function SchemaPage({ schema }: Props) {
  const storage = useMemo(() => new StorageAdapter(schema), [schema]);
  const [data, setData] = useState<DataRecord[]>([]);
  const [view, setView] = useState<ViewMode>({ type: 'list' });

  useEffect(() => {
    setData(storage.list());
    setView({ type: 'list' });
  }, [storage]);

  const reload = () => setData(storage.list());

  const handleCreate = (formData: Record<string, unknown>) => {
    storage.create(formData as Omit<DataRecord, 'id' | 'createdAt' | 'updatedAt'>);
    reload();
    setView({ type: 'list' });
  };

  const handleUpdate = (item: DataRecord, formData: Record<string, unknown>) => {
    storage.update(item.id, formData);
    reload();
    setView({ type: 'list' });
  };

  const handleDelete = (id: number) => {
    storage.delete(id);
    reload();
    setView({ type: 'list' });
  };

  const displayColumns = schema.fields.filter(
    (f) => f.type !== 'image-upload' && f.type !== 'textarea' && f.type !== 'password',
  ).slice(0, 4);

  const formatCellValue = (item: DataRecord, field: typeof schema.fields[number]): string => {
    const value = item[field.name];
    if (value == null || value === '') return '-';
    if (field.type === 'select' || field.type === 'radio') {
      const opt = field.options?.find((o) => o.value === value);
      return opt?.label ?? String(value);
    }
    if (field.type === 'checkbox' && Array.isArray(value)) {
      return (value as string[])
        .map((v) => field.options?.find((o) => o.value === v)?.label ?? v)
        .join('、');
    }
    if (field.type === 'date') {
      return new Date(String(value)).toLocaleDateString('zh-CN');
    }
    return String(value);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          {schema.displayName}管理
        </h1>
        <button
          onClick={() => setView({ type: 'create' })}
          className="px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
        >
          + 新建{schema.displayName}
        </button>
      </div>

      {/* Count */}
      <p className="text-xs text-gray-400 mb-3">共 {data.length} 条</p>

      {/* Table */}
      {data.length === 0 ? (
        <p className="text-center py-8 text-gray-400 text-sm">暂无数据</p>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {displayColumns.map((f) => (
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
                  {displayColumns.map((field) => (
                    <td key={field.name} className="px-4 py-3 text-sm whitespace-nowrap">
                      {formatCellValue(item, field)}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right text-sm whitespace-nowrap">
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => setView({ type: 'detail', item })}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        查看
                      </button>
                      <button
                        onClick={() => setView({ type: 'edit', item })}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => {
                          if (!confirm('确定要删除吗？')) return;
                          handleDelete(item.id);
                        }}
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
      )}

      {/* Create Modal */}
      {view.type === 'create' && (
        <Modal onClose={() => setView({ type: 'list' })}>
          <h2 className="text-lg font-bold mb-4">新建{schema.displayName}</h2>
          <CreateForm
            schema={schema}
            onSubmit={handleCreate}
            onCancel={() => setView({ type: 'list' })}
          />
        </Modal>
      )}

      {/* Detail Modal */}
      {view.type === 'detail' && (
        <Modal onClose={() => setView({ type: 'list' })}>
          <h2 className="text-lg font-bold mb-4">{schema.displayName}详情</h2>
          <DetailPanel
            schema={schema}
            data={view.item}
            onEdit={() => setView({ type: 'edit', item: view.item })}
            onClose={() => setView({ type: 'list' })}
          />
        </Modal>
      )}

      {/* Edit Modal */}
      {view.type === 'edit' && (
        <Modal onClose={() => setView({ type: 'list' })}>
          <h2 className="text-lg font-bold mb-4">编辑{schema.displayName}</h2>
          <EditForm
            schema={schema}
            initialData={view.item}
            onSubmit={(formData) => handleUpdate(view.item, formData)}
            onDelete={handleDelete}
            onCancel={() => setView({ type: 'list' })}
          />
        </Modal>
      )}
    </div>
  );
}
