import type { Field, ModelConfig } from './types';

export class DSLParser {
  constructor(private model: ModelConfig) {}

  getFields(): Field[] {
    return this.model.fields;
  }

  getFormFields(): Field[] {
    return this.model.fields.filter(
      (f) => !f.hidden && f.showInForm !== false,
    );
  }

  getTableColumns(): Field[] {
    const names = this.model.ui.table.columns;
    return this.model.fields.filter((f) => names.includes(f.name));
  }

  getFilters() {
    return (this.model.ui.filters ?? []).map((fc) => {
      const field = this.model.fields.find((f) => f.name === fc.field)!;
      return field;
    });
  }

  getDefaultValues(): Record<string, string> {
    const defaults: Record<string, string> = {};
    for (const f of this.model.fields) {
      if (f.defaultValue !== undefined) defaults[f.name] = f.defaultValue;
    }
    return defaults;
  }

  validate(data: Record<string, unknown>) {
    const errors: Record<string, string> = {};

    for (const field of this.model.fields) {
      const value = data[field.name] as string | undefined;

      if (field.required && !value?.trim()) {
        errors[field.name] = `${field.label}是必填的`;
        continue;
      }

      if (field.validation?.min && value && value.length < field.validation.min) {
        errors[field.name] =
          field.validation.message ?? `最少${field.validation.min}个字符`;
      }
    }

    return { isValid: Object.keys(errors).length === 0, errors };
  }
}
