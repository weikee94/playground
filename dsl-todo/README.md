# dsl-todo

用 **DSL（配置驱动）架构** 实现的 Todo Dashboard。通过一个 JSON 配置自动生成表单、表格、筛选器、CRUD 操作。

## 核心概念

```
todo.model.ts (30 行配置)
       │
       ├── DSLParser      → 解析字段、列、筛选器、验证规则
       ├── FormGenerator   → 自动渲染表单（text/select/date/textarea）
       ├── TableGenerator  → 自动渲染表格 + 状态标签 + 操作按钮
       ├── StorageAdapter  → localStorage CRUD
       └── ModelPage       → 组装一切
```

**添加新字段？只改配置，零 UI 代码：**

```typescript
// 在 todo.model.ts 的 fields 数组加一行
{ name: "tags", label: "标签", type: "text", placeholder: "用逗号分隔" }
// → 表单和表格自动出现新字段
```

## Stack

| Tech | 用途 |
|------|------|
| React + TypeScript | UI 框架 |
| Vite | 构建工具 |
| Tailwind CSS | 样式 |
| localStorage | 数据持久化 |

## Local Development

```bash
npm install
npm run dev    # http://localhost:5173
```

## DSL Engine 架构

```
src/engine/
├── types.ts           # 类型定义（Field, ModelConfig, Record）
├── DSLParser.ts       # 解析配置 → getFormFields/getTableColumns/validate
├── FormGenerator.tsx  # 根据 field.type 渲染对应 input
├── TableGenerator.tsx # 根据 columns 渲染表格 + badge
└── StorageAdapter.ts  # localStorage CRUD（list/create/update/delete）
```

## Deploy

纯前端项目，直接部署 Vercel：
- **Framework Preset**: Vite
- **Root Directory**: `dsl-todo`
- 无需环境变量
