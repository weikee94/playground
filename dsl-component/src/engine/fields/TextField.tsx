import type { FieldComponentProps } from '../types';

export function TextField({ field, value, onChange }: FieldComponentProps) {
  const inputType = field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : field.type === 'password' ? 'password' : 'text';

  return (
    <input
      type={inputType}
      value={String(value ?? '')}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
    />
  );
}
