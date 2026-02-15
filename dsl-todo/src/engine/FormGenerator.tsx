import { useState } from 'react';
import type { DSLParser } from './DSLParser';

interface Props {
  parser: DSLParser;
  initialData?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel?: () => void;
}

export function FormGenerator({ parser, initialData = {}, onSubmit, onCancel }: Props) {
  const formFields = parser.getFormFields();
  const defaults = parser.getDefaultValues();

  const [formData, setFormData] = useState<Record<string, string>>({
    ...defaults,
    ...Object.fromEntries(
      Object.entries(initialData).map(([k, v]) => [k, String(v ?? '')]),
    ),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: string) => {
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
    const validation = parser.validate(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formFields.map((field) => {
        const value = formData[field.name] ?? '';
        const error = errors[field.name];

        return (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>

            {field.type === 'textarea' ? (
              <textarea
                value={value}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            ) : field.type === 'select' ? (
              <select
                value={value}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">请选择...</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type === 'date' ? 'date' : 'text'}
                value={value}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                readOnly={field.readOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            )}

            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        );
      })}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
        >
          {initialData?.id ? '更新' : '创建'}
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
