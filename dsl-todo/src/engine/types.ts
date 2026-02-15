export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldValidation {
  min?: number;
  message?: string;
}

export interface Field {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'datetime' | 'number';
  required?: boolean;
  hidden?: boolean;
  readOnly?: boolean;
  showInForm?: boolean;
  placeholder?: string;
  defaultValue?: string;
  options?: FieldOption[];
  validation?: FieldValidation;
}

export interface ModelConfig {
  modelName: string;
  displayName: string;
  fields: Field[];
  ui: {
    table: {
      columns: string[];
    };
    filters?: { field: string }[];
  };
  storage: {
    type: 'localStorage';
    key: string;
  };
}

export interface Record {
  id: number;
  createdAt: string;
  [key: string]: unknown;
}
