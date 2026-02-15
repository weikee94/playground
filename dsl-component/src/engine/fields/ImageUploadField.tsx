import { useRef } from 'react';
import type { FieldComponentProps } from '../types';

export function ImageUploadField({ value, onChange }: FieldComponentProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = typeof value === 'string' && value ? value : null;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      {preview ? (
        <div className="flex items-start gap-3">
          <img
            src={preview}
            alt="预览"
            className="w-20 h-20 object-cover rounded border border-gray-200"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs text-red-500 hover:text-red-700"
          >
            移除
          </button>
        </div>
      ) : (
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700 file:rounded-md file:cursor-pointer hover:file:bg-gray-200"
        />
      )}
    </div>
  );
}
