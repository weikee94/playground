import { useEffect, useMemo, useState } from 'react';
import { DSLParser } from '../engine/DSLParser';
import { StorageAdapter } from '../engine/StorageAdapter';
import { FormGenerator } from '../engine/FormGenerator';
import { TableGenerator } from '../engine/TableGenerator';
import { Modal } from './Modal';
import type { ModelConfig, Record } from '../engine/types';

interface Props {
  model: ModelConfig;
}

export function ModelPage({ model }: Props) {
  const parser = useMemo(() => new DSLParser(model), [model]);
  const storage = useMemo(() => new StorageAdapter(model), [model]);

  const [data, setData] = useState<Record[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Record | null>(null);

  useEffect(() => {
    setData(storage.list());
  }, [storage]);

  const filteredData = useMemo(() => {
    if (!Object.values(filters).some(Boolean)) return data;
    return data.filter((item) =>
      Object.entries(filters).every(
        ([key, value]) => !value || item[key] === value,
      ),
    );
  }, [data, filters]);

  const reload = () => setData(storage.list());

  const handleCreate = (formData: Record<string, unknown>) => {
    storage.create(formData as Omit<Record, 'id' | 'createdAt'>);
    reload();
    setShowCreate(false);
  };

  const handleUpdate = (formData: Record<string, unknown>) => {
    if (!editing) return;
    storage.update(editing.id, formData);
    reload();
    setEditing(null);
  };

  const handleDelete = (id: number) => {
    if (!confirm('确定要删除吗？')) return;
    storage.delete(id);
    reload();
  };

  const handleToggleStatus = (item: Record) => {
    storage.update(item.id, {
      status: item.status === 'done' ? 'pending' : 'done',
    });
    reload();
  };

  const filterFields = parser.getFilters();

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          {model.displayName}管理
        </h1>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
        >
          + 新建{model.displayName}
        </button>
      </div>

      {/* Filters */}
      {filterFields.length > 0 && (
        <div className="flex gap-4 mb-4 items-end">
          {filterFields.map((field) => (
            <div key={field.name}>
              <label className="block text-xs text-gray-500 mb-1">
                {field.label}
              </label>
              <select
                value={filters[field.name] ?? ''}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, [field.name]: e.target.value }))
                }
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
              >
                <option value="">全部</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
          {Object.values(filters).some(Boolean) && (
            <button
              onClick={() => setFilters({})}
              className="text-xs text-gray-500 hover:text-gray-700 pb-1.5"
            >
              清除筛选
            </button>
          )}
        </div>
      )}

      {/* Count */}
      <p className="text-xs text-gray-400 mb-3">
        共 {filteredData.length} 条
        {Object.values(filters).some(Boolean) && ' (已筛选)'}
      </p>

      {/* Table */}
      <TableGenerator
        parser={parser}
        data={filteredData}
        onEdit={setEditing}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      {/* Create Modal */}
      {showCreate && (
        <Modal onClose={() => setShowCreate(false)}>
          <h2 className="text-lg font-bold mb-4">新建{model.displayName}</h2>
          <FormGenerator
            parser={parser}
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
          />
        </Modal>
      )}

      {/* Edit Modal */}
      {editing && (
        <Modal onClose={() => setEditing(null)}>
          <h2 className="text-lg font-bold mb-4">编辑{model.displayName}</h2>
          <FormGenerator
            parser={parser}
            initialData={editing}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}
    </div>
  );
}
