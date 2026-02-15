# dsl-component

用 **Field Registry + Schema** 模式实现的动态组件系统。通过注册表机制和 Schema 配置，一个 `SchemaForm` 组件能自动变成任何表单，同时提供 CreateForm / EditForm / DetailPanel 三种模式。

## 核心概念

```
Schema 配置 (user.schema.ts / product.schema.ts)
       │
       ├── FieldRegistry      → Map-based 字段注册表（核心机制）
       ├── DynamicField        → 查注册表 → 渲染对应字段组件
       ├── SchemaForm          → 万能表单（vertical/grid layout）
       ├── CreateForm          → 创建模式（空白 → 提交 → 成功提示）
       ├── EditForm            → 编辑模式（预填 → 还原 → 删除）
       ├── DetailPanel         → 查看模式（只读 → 格式化显示）
       ├── StorageAdapter      → localStorage CRUD
       └── SchemaPage          → 组装一切（list/create/edit/detail）
```

**与 dsl-todo 的区别：** dsl-todo 用 inline if/else 渲染字段，这个项目用 Map-based Field Registry 实现可扩展的字段类型系统。

**添加新字段类型？注册一行：**

```typescript
// 1. 创建组件
function RichTextField({ field, value, onChange }: FieldComponentProps) { ... }

// 2. 注册
registerField('rich-text', RichTextField);

// 3. 在 schema 中使用
{ name: "content", type: "rich-text", label: "文章内容" }
// → 自动 work！
```

## 支持的字段类型

| 类型 | 组件 | 说明 |
|------|------|------|
| text | TextField | 文本输入 |
| email | TextField | 邮箱输入 |
| password | TextField | 密码输入 |
| number | TextField | 数字输入 |
| textarea | TextAreaField | 多行文本 |
| select | SelectField | 下拉选择 |
| radio | RadioField | 单选组 |
| checkbox | CheckboxField | 多选组 |
| date | DateField | 日期选择 |
| image-upload | ImageUploadField | 图片上传（base64 预览） |

## Stack

| Tech | 用途 |
|------|------|
| React + TypeScript | UI 框架 |
| Vite | 构建工具 |
| Tailwind CSS v4 | 样式 |
| localStorage | 数据持久化 |

## Local Development

```bash
npm install
npm run dev    # http://localhost:5173
```

## Engine 架构

```
src/engine/
├── types.ts              # FieldConfig, FormSchema, FieldComponentProps, DataRecord
├── FieldRegistry.ts      # Map-based 字段注册表
├── validate.ts           # 独立验证模块
├── DynamicField.tsx      # 查注册表渲染字段
├── fields/               # 各字段组件
│   ├── TextField.tsx
│   ├── TextAreaField.tsx
│   ├── SelectField.tsx
│   ├── RadioField.tsx
│   ├── CheckboxField.tsx
│   ├── DateField.tsx
│   ├── ImageUploadField.tsx
│   └── index.ts          # 注册所有字段
├── SchemaForm.tsx        # 万能表单（layout + validation）
├── CreateForm.tsx        # 创建模式
├── EditForm.tsx          # 编辑模式
├── DetailPanel.tsx       # 只读查看
└── StorageAdapter.ts     # localStorage CRUD
```

## Deploy

纯前端项目，直接部署 Vercel：
- **Framework Preset**: Vite
- **Root Directory**: `dsl-component`
- 无需环境变量
