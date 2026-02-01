---
title: TypeScript 架构与最佳实践笔记
tags: TypeScript, 设计模式, 泛型, 装饰器, 前端架构
date: 2026-02-01
---

# TypeScript 架构与最佳实践笔记

本文总结了 TypeScript 项目的架构设计与最佳实践，涵盖类型系统、设计模式、泛型约束、装饰器元编程等核心内容。

## 项目 TypeScript 架构总览

### 使用成熟度评估

本项目是一个**渐进式 TypeScript 教学仓库**，从基础类型到高级装饰器模式，展现了 TypeScript 的完整能力谱系：

| 维度 | 评估 |
|------|------|
| 类型覆盖度 | ★★★★☆ 全面覆盖基础到高级类型 |
| 设计模式应用 | ★★★★★ 单例、组合、装饰器模式完整实现 |
| 类型驱动程度 | ★★★★☆ 接口优先设计，泛型约束完善 |
| 框架集成 | ★★★★☆ Express 深度集成，类型安全路由 |

### 类型哲学定位

本项目将 TypeScript 视为**设计工具而非仅仅是约束**：

- **Interface 定义契约** → 模块间通信的类型协议
- **泛型提供复用能力** → 算法与数据结构解耦
- **装饰器实现元编程** → 声明式路由、中间件注入

## TypeScript 最佳实践详解

### 实践 1️⃣：构造器参数属性简写

#### 设计动机（Why）

传统写法需要重复声明属性和赋值，增加样板代码。TypeScript 提供语法糖直接在构造器参数中声明属性。

#### 项目中的实际做法

```typescript
// ❌ 不推荐：冗余的属性声明
class Person {
  public name: string;
  constructor(name: string) {
    this.name = name;
  }
}

// ✅ 推荐：参数属性简写
class Person {
  constructor(public name: string) {}
}

// ✅ 继承场景
class Teacher extends Person {
  constructor(public age: number) {
    super('dell');
  }
}
```

### 实践 2️⃣：使用 Interface 定义依赖契约

#### 设计动机（Why）

- 实现依赖倒置原则（DIP）
- 允许不同实现替换而不影响消费方
- 提供编译时契约检查

#### 项目中的实际做法

爬虫类通过 `Analyzer` 接口解耦数据解析逻辑：

```typescript
// ✅ 定义分析器契约
export interface Analyzer {
  analyze: (html: string, filePath: string) => string;
}

// ✅ 消费方仅依赖接口
class Crowller {
  constructor(
    private url: string,
    private analyzer: Analyzer  // 依赖抽象，而非具体实现
  ) {
    this.initSpiderProcess();
  }

  private async initSpiderProcess() {
    const html = await this.getRawHtml();
    const fileContent = this.analyzer.analyze(html, this.filePath);
    this.writeFile(fileContent);
  }
}

// ✅ 可替换的实现
const analyzer = DellAnalyzer.getInstance();
new Crowller(url, analyzer);
```

### 实践 3️⃣：单例模式的 TypeScript 实现

#### 设计动机（Why）

- 确保全局唯一实例
- 延迟初始化，节省资源
- 私有构造器从类型层面阻止外部实例化

#### 项目中的实际做法

```typescript
// ✅ 推荐：完整单例实现
class DellAnalyzer implements Analyzer {
  private static instance: DellAnalyzer;

  // 私有构造器阻止外部 new
  private constructor() {}

  static getInstance() {
    if (!DellAnalyzer.instance) {
      DellAnalyzer.instance = new DellAnalyzer();
    }
    return DellAnalyzer.instance;
  }

  public analyze(html: string, filePath: string): string {
    // 实现逻辑
  }
}

// 使用
const analyzer1 = DellAnalyzer.getInstance();
const analyzer2 = DellAnalyzer.getInstance();
console.log(analyzer1 === analyzer2); // true
```

### 实践 4️⃣：使用 Getter/Setter 封装属性访问

#### 设计动机（Why）

- 控制属性的读写逻辑
- 支持计算属性
- 保持 API 向后兼容的同时修改内部实现

#### 项目中的实际做法

```typescript
class Person {
  constructor(private _name: string) {}

  // ✅ Getter：读取时添加后缀
  get name() {
    return this._name + ' lee';
  }

  // ✅ Setter：写入时处理数据
  set name(name: string) {
    const realName = name.split(' ')[0];
    this._name = realName;
  }
}

const person = new Person('dell');
console.log(person.name);  // 'dell lee'
person.name = 'dell lee';
console.log(person.name);  // 'dell lee' (内部存储 'dell')
```

### 实践 5️⃣：泛型 + keyof 实现类型安全的属性访问

#### 设计动机（Why）

- 编译时检查属性名是否存在
- 返回值类型自动推断
- 避免运行时属性访问错误

#### 项目中的实际做法

```typescript
interface Person {
  name: string;
  age: number;
  gender: string;
}

class Teacher {
  constructor(private info: Person) {}

  // ✅ T 被约束为 Person 的键名
  // 返回类型 Person[T] 自动推断
  getInfo<T extends keyof Person>(key: T): Person[T] {
    return this.info[key];
  }
}

const teacher = new Teacher({
  name: 'dell',
  age: 18,
  gender: 'male'
});

const name = teacher.getInfo('name');   // 类型：string
const age = teacher.getInfo('age');     // 类型：number
// teacher.getInfo('invalid');          // ❌ 编译错误
```

### 实践 6️⃣：扩展第三方库的类型定义

#### 设计动机（Why）

- Express 的 `Request.body` 默认类型过于宽松
- 需要添加自定义属性（如 session）
- 保持类型安全的同时使用中间件注入的属性

#### 项目中的实际做法

```typescript
import { Request, Response } from 'express';

// ✅ 扩展 Request 接口
interface RequestWithBody extends Request {
  body: {
    [key: string]: string | undefined;
  };
}

router.post('/login', (req: RequestWithBody, res: Response) => {
  const { password } = req.body;  // 类型安全访问
  const isLogin = req.session ? req.session.login : false;
  // ...
});
```

### 实践 7️⃣：Enum 替代魔法字符串

#### 设计动机（Why）

- 提供命名常量集合
- 支持反向映射（值 → 名称）
- 比对象字面量更好的类型约束

#### 项目中的实际做法

```typescript
// ✅ 推荐：使用 Enum
enum Status {
  OFFLINE = 1,
  ONLINE,
  DELETED
}

function getResult(status: Status) {
  if (status === Status.OFFLINE) return 'offline';
  if (status === Status.ONLINE) return 'online';
  if (status === Status.DELETED) return 'deleted';
  return 'error';
}

console.log(Status.OFFLINE);  // 1
console.log(Status[1]);        // 'OFFLINE' (反向映射)

// ❌ 不推荐：普通对象无法约束参数类型
const StatusObj = { OFFLINE: 0, ONLINE: 1, DELETED: 2 };
```

### 实践 8️⃣：装饰器 + reflect-metadata 实现声明式路由

#### 设计动机（Why）

- 将路由配置从命令式代码中解耦
- 元数据驱动的路由注册
- 支持中间件的声明式组合

#### 项目中的实际做法

```typescript
// ✅ 路由装饰器定义
export function get(path: string) {
  return function(target: any, key: string) {
    Reflect.defineMetadata('path', path, target, key);
    Reflect.defineMetadata('method', 'get', target, key);
  };
}

// ✅ 中间件装饰器
export function use(middleware: RequestHandler) {
  return function(target: any, key: string) {
    const middlewares = Reflect.getMetadata('middlewares', target, key) || [];
    middlewares.push(middleware);
    Reflect.defineMetadata('middlewares', middlewares, target, key);
  };
}

// ✅ 控制器装饰器（收集并注册路由）
export function controller(root: string) {
  return function(target: new (...args: any[]) => any) {
    for (let key in target.prototype) {
      const path = Reflect.getMetadata('path', target.prototype, key);
      const method = Reflect.getMetadata('method', target.prototype, key);
      const middlewares = Reflect.getMetadata('middlewares', target.prototype, key);
      const handler = target.prototype[key];

      if (path && method) {
        const fullPath = root === '/' ? path : `${root}${path}`;
        if (middlewares?.length) {
          router[method](fullPath, ...middlewares, handler);
        } else {
          router[method](fullPath, handler);
        }
      }
    }
  };
}
```

**使用示例**:

```typescript
@controller('/')
export class CrowllerController {
  @get('/getData')
  @use(checkLogin)
  @use(logger)
  getData(req: Request, res: Response): void {
    res.json(getResponseData(true));
  }
}
```

### 实践 9️⃣：元组类型约束固定结构数组

#### 设计动机（Why）

- 数组长度和每个位置的类型都需要固定
- 常用于 CSV 行、函数多返回值、坐标等场景

#### 项目中的实际做法

```typescript
// ✅ 元组：固定长度和位置类型
const teacherInfo: [string, string, number] = ['Dell', 'male', 18];

// ✅ 元组数组（表格数据）
const teacherList: [string, string, number][] = [
  ['dell', 'male', 19],
  ['sun', 'female', 26],
  ['jeny', 'female', 38]
];

// ❌ 普通数组无法约束位置类型
const arr: (string | number)[] = ['Dell', 18, 'male']; // 顺序可乱
```

### 实践 🔟：抽象类定义模板方法

#### 设计动机（Why）

- 定义算法骨架，子类实现具体步骤
- 抽象方法强制子类实现
- 可包含通用实现代码

#### 项目中的实际做法

```typescript
// ✅ 抽象类：不能直接实例化
abstract class Geom {
  width: number = 0;

  // 通用方法
  getType() {
    return 'Geom';
  }

  // 抽象方法：子类必须实现
  abstract getArea(): number;
}

class Circle extends Geom {
  constructor(private radius: number) {
    super();
  }

  getArea() {
    return Math.PI * this.radius ** 2;
  }
}

class Square extends Geom {
  constructor(private side: number) {
    super();
  }

  getArea() {
    return this.side ** 2;
  }
}
```

## 常见类型设计模式

### 1. 索引签名模式（Index Signature Pattern）

用于描述动态键名的对象：

```typescript
interface Content {
  [propName: number]: Course[];  // 时间戳作为键
}

interface Person {
  name: string;
  [propName: string]: any;  // 允许额外属性
}
```

### 2. 接口继承模式（Interface Extension）

```typescript
interface Person {
  name: string;
}

interface Teacher extends Person {
  teachingAge: number;
}

interface Student extends Person {
  grade: number;
}
```

### 3. 泛型约束模式（Generic Constraint）

```typescript
// 约束泛型必须是特定类型
class DataManager<T extends number | string> {
  constructor(private data: T[]) {}
}

// 约束泛型必须有某个属性
interface Item { name: string; }
class Manager<T extends Item> {
  constructor(private data: T[]) {}
}
```

### 4. 函数类型签名模式

```typescript
// 独立类型声明
interface SayHi {
  (word: string): string;
}

// 泛型函数类型
const func: <T>(param: T) => T = (param) => param;
```

### 5. 只读属性模式（Readonly Pattern）

```typescript
interface Config {
  readonly apiUrl: string;
  readonly timeout: number;
}
```

## 可迁移的通用 TypeScript 原则

### 类型系统思维

- **类型先行**：先定义 Interface，再实现类
- **最小暴露**：public/private/protected 控制可见性
- **类型收窄**：善用 typeof、instanceof、in 进行类型守卫

### 泛型设计原则

- **按需约束**：`<T extends SomeType>` 而非无约束 `<T>`
- **keyof 索引**：`<T extends keyof Obj>` 实现类型安全的属性访问
- **推断优先**：让 TS 推断泛型参数，减少显式声明

### 代码组织原则

- **接口分离**：不同职责的类型放不同文件
- **类型导出**：公共类型显式 export，内部类型保持私有
- **常量枚举**：用 `const enum` 减少运行时开销

### 配置策略

```json
{
  "compilerOptions": {
    "strict": true,                    // 必开：启用所有严格检查
    "esModuleInterop": true,           // 必开：兼容 CommonJS
    "experimentalDecorators": true,    // 按需：装饰器支持
    "emitDecoratorMetadata": true      // 按需：装饰器元数据
  }
}
```

## 个人读书笔记式总结

### 我从这个项目中学到的 TS 设计思想

#### 1. 类型是设计文档

Interface 不仅是运行时约束，更是模块间的**通信协议**。当我看到：

```typescript
interface Analyzer {
  analyze: (html: string, filePath: string) => string;
}
```

我立刻知道任何实现这个接口的类需要做什么，这比注释更可靠。

#### 2. 泛型是抽象的最高形式

从 `Array<T>` 到 `<T extends keyof Person>`，泛型让我能够：
- 写一次代码，服务多种类型
- 保持类型安全的同时提供灵活性
- 用类型参数表达"关系"而非具体类型

#### 3. 装饰器是元编程的入口

装饰器 + reflect-metadata 的组合让我看到了 TypeScript 的另一面：
- 运行时可以访问编译时的类型信息
- 声明式编程在 TS 中完全可行
- 框架级抽象（如路由注册）可以非常优雅

#### 4. 单例模式的 TS 实现比 JS 更安全

`private constructor()` 从**类型层面**阻止了外部实例化，这是纯 JS 做不到的。TypeScript 的访问修饰符让设计模式的意图更加明确。

#### 5. 类型扩展是与第三方库协作的关键

Express 的 `Request` 类型不够用？扩展它：

```typescript
interface RequestWithBody extends Request {
  body: { [key: string]: string | undefined };
}
```

这种模式适用于任何需要增强的第三方类型。

### 值得反复回顾的核心概念

| 概念 | 一句话理解 |
|------|-----------|
| `keyof T` | 获取类型 T 的所有键名组成的联合类型 |
| `T[K]` | 索引访问类型，获取属性 K 的类型 |
| `extends` | 在泛型中是"约束"，在类/接口中是"继承" |
| `Reflect.defineMetadata` | 运行时在对象上存储元数据 |
| `PropertyDescriptor` | 方法装饰器的核心：控制方法行为 |

### 下一步学习方向

1. **Utility Types**：`Partial<T>`, `Pick<T, K>`, `Omit<T, K>` 等内置工具类型
2. **Conditional Types**：`T extends U ? X : Y` 条件类型
3. **Mapped Types**：`{ [K in keyof T]: T[K] }` 映射类型
4. **Template Literal Types**：模板字符串类型
