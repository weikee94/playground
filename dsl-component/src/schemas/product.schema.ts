import type { FormSchema } from '../engine/types';

export const productSchema: FormSchema = {
  name: 'Product',
  displayName: '产品',
  fields: [
    {
      name: 'name',
      label: '产品名称',
      type: 'text',
      required: true,
      placeholder: '输入产品名称',
    },
    {
      name: 'price',
      label: '价格',
      type: 'number',
      required: true,
      placeholder: '0.00',
      validation: { min: 0, message: '价格不能为负' },
    },
    {
      name: 'category',
      label: '分类',
      type: 'select',
      required: true,
      options: [
        { value: 'electronics', label: '电子产品' },
        { value: 'clothing', label: '服装' },
        { value: 'food', label: '食品' },
        { value: 'books', label: '图书' },
      ],
    },
    {
      name: 'status',
      label: '状态',
      type: 'radio',
      defaultValue: 'active',
      options: [
        { value: 'active', label: '上架' },
        { value: 'inactive', label: '下架' },
      ],
    },
    {
      name: 'description',
      label: '产品描述',
      type: 'textarea',
      placeholder: '描述产品特点...',
    },
  ],
  storage: { type: 'localStorage', key: 'dsl_products' },
};
