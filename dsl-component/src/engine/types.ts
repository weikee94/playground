export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'image-upload';

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  defaultValue?: unknown;
  options?: FieldOption[];
  validation?: FieldValidation;
  gridColumn?: number;
}

export interface FormStep {
  title: string;
  fields: string[];
}

export interface FormSchema {
  name: string;
  displayName: string;
  fields: FieldConfig[];
  layout?: {
    type: 'vertical' | 'grid';
    columns?: number;
  };
  steps?: FormStep[];
  storage: {
    type: 'localStorage';
    key: string;
  };
}

export interface FieldComponentProps {
  field: FieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
}

export interface DataRecord {
  id: number;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}
