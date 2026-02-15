import type { FieldComponentProps } from '../types';

export function TextAreaField({ field, value, onChange }: FieldComponentProps) {
  return (
    <textarea
      value={String(value ?? '')}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      rows={3}
      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
    />
  );
}
