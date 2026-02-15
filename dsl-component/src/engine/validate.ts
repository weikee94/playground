import type { FieldConfig } from './types';

export function validateField(field: FieldConfig, value: unknown): string | null {
  const strValue = typeof value === 'string' ? value : '';
  const arrValue = Array.isArray(value) ? value : [];

  if (field.required) {
    if (field.type === 'checkbox') {
      if (arrValue.length === 0) return `${field.label}是必填的`;
    } else {
      if (!strValue.trim()) return `${field.label}是必填的`;
    }
  }

  if (!strValue && arrValue.length === 0) return null;

  if (field.validation?.min !== undefined && strValue) {
    if (field.type === 'number') {
      if (Number(strValue) < field.validation.min) {
        return field.validation.message ?? `最小值为${field.validation.min}`;
      }
    } else {
      if (strValue.length < field.validation.min) {
        return field.validation.message ?? `最少${field.validation.min}个字符`;
      }
    }
  }

  if (field.validation?.max !== undefined && strValue) {
    if (field.type === 'number') {
      if (Number(strValue) > field.validation.max) {
        return field.validation.message ?? `最大值为${field.validation.max}`;
      }
    } else {
      if (strValue.length > field.validation.max) {
        return field.validation.message ?? `最多${field.validation.max}个字符`;
      }
    }
  }

  if (field.validation?.pattern && strValue) {
    const regex = new RegExp(field.validation.pattern);
    if (!regex.test(strValue)) {
      return field.validation.message ?? '格式不正确';
    }
  }

  return null;
}

export function validateForm(
  fields: FieldConfig[],
  data: Record<string, unknown>,
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    const error = validateField(field, data[field.name]);
    if (error) errors[field.name] = error;
  }
  return { isValid: Object.keys(errors).length === 0, errors };
}
