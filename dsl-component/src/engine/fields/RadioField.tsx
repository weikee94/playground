import type { FieldComponentProps } from '../types';

export function RadioField({ field, value, onChange }: FieldComponentProps) {
  return (
    <div className="flex gap-4 py-1">
      {field.options?.map((opt) => (
        <label key={opt.value} className="flex items-center gap-1.5 text-sm cursor-pointer">
          <input
            type="radio"
            name={field.name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="accent-blue-500"
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}
