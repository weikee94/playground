import { useState } from 'react';
import { DynamicField } from './DynamicField';
import { validateForm } from './validate';
import type { FormSchema } from './types';

interface Props {
  schema: FormSchema;
  fields?: FormSchema['fields'];
  initialData?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export function SchemaForm({
  schema,
  fields: fieldOverride,
  initialData = {},
  onSubmit,
  onCancel,
  submitLabel,
}: Props) {
  const fields = fieldOverride ?? schema.fields;

  const getDefaults = () => {
    const defaults: Record<string, unknown> = {};
    for (const f of schema.fields) {
      if (f.defaultValue !== undefined) defaults[f.name] = f.defaultValue;
    }
    return defaults;
  };

  const [formData, setFormData] = useState<Record<string, unknown>>({
    ...getDefaults(),
    ...initialData,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateForm(fields, formData);
    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }
    onSubmit(formData);
  };

  const isGrid = schema.layout?.type === 'grid';
  const columns = schema.layout?.columns ?? 2;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div
        className={isGrid ? 'grid gap-4' : 'space-y-4'}
        style={isGrid ? { gridTemplateColumns: `repeat(${columns}, 1fr)` } : undefined}
      >
        {fields.map((field) => (
          <div
            key={field.name}
            style={isGrid && field.gridColumn ? { gridColumn: `span ${field.gridColumn}` } : undefined}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <DynamicField
              field={field}
              value={formData[field.name]}
              onChange={(v) => handleChange(field.name, v)}
              error={errors[field.name]}
            />
            {errors[field.name] && (
              <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
        >
          {submitLabel ?? (initialData?.id ? '更新' : '创建')}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
          >
            取消
          </button>
        )}
      </div>
    </form>
  );
}
