import type { FormSchema } from '../engine/types';

export const userSchema: FormSchema = {
  name: 'User',
  displayName: '用户',
  fields: [
    {
      name: 'name',
      label: '姓名',
      type: 'text',
      required: true,
      placeholder: '请输入姓名',
      validation: { min: 2, message: '至少2个字符' },
    },
    {
      name: 'email',
      label: '邮箱',
      type: 'email',
      required: true,
      placeholder: 'name@example.com',
      validation: { pattern: '^[^@]+@[^@]+\\.[^@]+$', message: '邮箱格式不正确' },
    },
    {
      name: 'avatar',
      label: '头像',
      type: 'image-upload',
      gridColumn: 2,
    },
    {
      name: 'gender',
      label: '性别',
      type: 'radio',
      options: [
        { value: 'male', label: '男' },
        { value: 'female', label: '女' },
        { value: 'other', label: '其他' },
      ],
    },
    {
      name: 'interests',
      label: '兴趣爱好',
      type: 'checkbox',
      options: [
        { value: 'coding', label: '编程' },
        { value: 'reading', label: '阅读' },
        { value: 'sports', label: '运动' },
        { value: 'music', label: '音乐' },
        { value: 'travel', label: '旅行' },
      ],
    },
    {
      name: 'bio',
      label: '个人简介',
      type: 'textarea',
      placeholder: '介绍一下自己...',
      gridColumn: 2,
    },
  ],
  layout: { type: 'grid', columns: 2 },
  storage: { type: 'localStorage', key: 'dsl_users' },
};
