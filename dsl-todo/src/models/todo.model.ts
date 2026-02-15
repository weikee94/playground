import type { ModelConfig } from '../engine/types';

export const todoModel: ModelConfig = {
  modelName: 'Todo',
  displayName: '待办事项',
  fields: [
    {
      name: 'title',
      label: '任务标题',
      type: 'text',
      required: true,
      placeholder: '输入任务...',
      validation: { min: 2, message: '至少2个字符' },
    },
    {
      name: 'description',
      label: '描述',
      type: 'textarea',
      placeholder: '任务描述（可选）',
    },
    {
      name: 'status',
      label: '状态',
      type: 'select',
      options: [
        { value: 'pending', label: '待完成' },
        { value: 'in_progress', label: '进行中' },
        { value: 'done', label: '已完成' },
      ],
      defaultValue: 'pending',
    },
    {
      name: 'priority',
      label: '优先级',
      type: 'select',
      options: [
        { value: 'low', label: '低' },
        { value: 'medium', label: '中' },
        { value: 'high', label: '高' },
      ],
      defaultValue: 'medium',
    },
    {
      name: 'dueDate',
      label: '截止日期',
      type: 'date',
    },
  ],
  ui: {
    table: {
      columns: ['title', 'status', 'priority', 'dueDate'],
    },
    filters: [{ field: 'status' }, { field: 'priority' }],
  },
  storage: {
    type: 'localStorage',
    key: 'todos',
  },
};
