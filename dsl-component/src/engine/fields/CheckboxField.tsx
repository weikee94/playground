import type { FieldComponentProps } from '../types';

export function CheckboxField({ field, value, onChange }: FieldComponentProps) {
  const selected = Array.isArray(value) ? (value as string[]) : [];

  const toggle = (optValue: string) => {
    if (selected.includes(optValue)) {
      onChange(selected.filter((v) => v !== optValue));
    } else {
      onChange([...selected, optValue]);
    }
  };

  return (
    <div className="flex flex-wrap gap-4 py-1">
      {field.options?.map((opt) => (
        <label key={opt.value} className="flex items-center gap-1.5 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={selected.includes(opt.value)}
            onChange={() => toggle(opt.value)}
            className="accent-blue-500"
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}
