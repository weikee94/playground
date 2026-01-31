---
title: 设计模式读书笔记
tags: JavaScript, TypeScript, 设计模式, 前端架构
date: 2026-02-01
---

# 设计模式读书笔记

本文总结了前端开发中常用的 7 种设计模式，包括工厂、单例、观察者、迭代器、原型、装饰器和代理模式。

## 项目设计模式总览

### 核心设计哲学

项目反复强调一个观点：**设计模式是"讲道理"的**，它们是纯理性思考的产物，用于应对变化和需求。

## 项目中使用的设计模式详解

### 工厂模式（Factory Pattern）

#### 使用动机（Why）

- **问题**：直接 `new Class()` 会让创建逻辑散落在代码各处，调用方需要了解类的内部结构
- **不用的后果**：高耦合、难以统一管理创建逻辑、无法链式操作

#### 项目中的实现方式（How in this repo）

采用**简单工厂**，一个 `Creator` 类负责根据参数返回不同产品实例：

```
design-pattern-wiki/04-工厂模式/
├── 02-介绍.md    # 汉堡店比喻：服务员=工厂，顾客不需要自己做
├── 03-演示.md    # 标准工厂 vs 简单工厂的 TypeScript 实现
└── 04-场景.md    # jQuery $、Vue _createElementVNode、React createElement
```

属于「**工程变体**」而非教科书式，省略了抽象工厂和建造者模式。

#### 示例代码（Example）

**✅ 推荐写法：工厂函数封装创建逻辑**

```ts
interface IProduct {
    name: string
    fn1: () => void
}

class Product1 implements IProduct {
    name: string
    constructor(name: string) { this.name = name }
    fn1() { console.log('product1 fn1') }
}

class Product2 implements IProduct {
    name: string
    constructor(name: string) { this.name = name }
    fn1() { console.log('product2 fn1') }
}

// 工厂类：隐藏创建细节
class Creator {
    create(type: string, name: string): IProduct {
        if (type === 'p1') return new Product1(name)
        if (type === 'p2') return new Product2(name)
        throw new Error('Invalid type')
    }
}

// 使用方只与工厂交互
const creator = new Creator()
const product = creator.create('p1', 'test')
```

**❌ 不推荐：直接暴露 new 给调用方**

```ts
// 调用方需要知道具体类名，高耦合
const p1 = new Product1('test')
const p2 = new Product2('test')
```

#### 真实前端场景

| 场景 | 工厂函数 | 产品 |
|------|---------|------|
| jQuery | `$('div')` | JQuery 实例 |
| Vue 模板编译 | `_createElementVNode()` | VNode |
| React JSX | `React.createElement()` | VNode |

#### 权衡与代价（Trade-offs）

- **引入复杂度**：多了一层抽象，简单场景可能过度设计
- **不该用的场景**：创建逻辑简单且固定、只有单一产品类型

### 单例模式（Singleton Pattern）

#### 使用动机（Why）

- **问题**：某些对象全局只需一个实例（登录框、全局状态存储）
- **不用的后果**：重复初始化浪费资源；多个实例导致状态不同步

#### 项目中的实现方式（How in this repo）

提供两种实现：
1. **TypeScript 版**：利用 `private constructor` + `static getInstance()`
2. **JavaScript 版**：利用闭包 + 模块化

```
design-pattern-wiki/05-单例模式/
├── 03-演示.md    # 两种实现方式
└── 04-场景.md    # 登录框、Vuex/Redux store、EventBus
```

#### 示例代码（Example）

**✅ 推荐写法：TypeScript 静态方法 + 私有构造函数**

```ts
class Singleton {
    private constructor() { }  // 禁止外部 new

    private static instance: Singleton | null = null

    static getInstance(): Singleton {
        if (Singleton.instance == null) {
            Singleton.instance = new Singleton()
        }
        return Singleton.instance
    }
}

const s1 = Singleton.getInstance()
const s2 = Singleton.getInstance()
console.log(s1 === s2) // true
```

**✅ 推荐写法：JavaScript 闭包 + 模块化**

```js
// singleton.js
let instance

class Singleton {}

export default () => {
    if (instance == null) {
        instance = new Singleton()
    }
    return instance
}
```

**❌ 不推荐：让调用方自己保证单例**

```ts
// 调用方可能忘记检查，创建多个实例
const store1 = new Store()
const store2 = new Store()  // 数据不同步！
```

#### 真实前端场景

- **登录框/弹窗**：全局只需一个 DOM 实例
- **Vuex / Redux store**：全局状态必须单例
- **EventBus**：自定义事件中心

#### 权衡与代价（Trade-offs）

- **引入复杂度**：需要额外的 `getInstance` 方法
- **不该用的场景**：对象本身就是无状态的工具函数
- **注意**：JS 是单线程，不需要考虑线程锁；Java 等多线程语言需要加锁

### 观察者模式（Observer Pattern）

#### 使用动机（Why）

- **问题**：一个对象状态变化需要通知多个依赖方
- **不用的后果**：硬编码调用关系，耦合度高，难以扩展

#### 项目中的实现方式（How in this repo）

Subject（主题）持有 Observer（观察者）列表，状态变化时主动 `notify()` 所有观察者。

```
design-pattern-wiki/06-观察者模式/
├── 02-介绍.md    # 星巴克点咖啡比喻
├── 03-演示.md    # Subject + Observer 经典实现
├── 04-场景.md    # DOM事件、Vue生命周期、各种回调
└── 05-对比发布订阅模式.md  # 核心区别：是否有中间媒介
```

#### 示例代码（Example）

**✅ 推荐写法：经典观察者模式**

```ts
class Subject {
    private state: number = 0
    private observers: Observer[] = []

    setState(newState: number) {
        this.state = newState
        this.notify()  // 状态变化，自动通知
    }

    attach(observer: Observer) {
        this.observers.push(observer)
    }

    private notify() {
        for (const observer of this.observers) {
            observer.update(this.state)
        }
    }
}

class Observer {
    name: string
    constructor(name: string) { this.name = name }

    update(state: number) {
        console.log(`${this.name} received: ${state}`)
    }
}

// 使用
const sub = new Subject()
sub.attach(new Observer('A'))
sub.attach(new Observer('B'))
sub.setState(1)  // A 和 B 都会收到通知
```

#### 观察者模式 vs 发布订阅模式

| 特征 | 观察者模式 | 发布订阅模式 |
|------|-----------|-------------|
| 耦合关系 | Subject 和 Observer **直接绑定** | Publisher 和 Subscriber **不认识**，通过 EventBus 中介 |
| 典型 API | `addEventListener` | `event.on()` / `event.emit()` |
| 触发方式 | Subject 内部自动触发 | 需要显式调用 `emit()` |

#### 真实前端场景

- **DOM 事件**：`$btn.click(fn1); $btn.click(fn2)`
- **Vue/React 生命周期**：组件状态变化触发钩子
- **Vue watch**：数据变化自动触发回调
- **Node.js stream/readline**：`readStream.on('data', callback)`
- **MutationObserver**：监听 DOM 变化

#### 权衡与代价（Trade-offs）

- **引入复杂度**：需要维护观察者列表
- **注意事项**：Vue/React 组件销毁前必须 `off` 自定义事件，否则内存泄漏
- **不该用的场景**：一对一的简单通知关系

### 迭代器模式（Iterator Pattern）

#### 使用动机（Why）

- **问题**：遍历集合时需要知道其内部结构（长度、如何取值）
- **不用的后果**：遍历逻辑与数据结构耦合，换一种数据结构就要改遍历代码

#### 项目中的实现方式（How in this repo）

强调「**for 循环不是迭代器模式**」—— 真正的迭代器隐藏内部结构，只暴露 `next()` 和 `hasNext()`。

```
design-pattern-wiki/07-迭代器模式/
├── 02-介绍.md    # for循环 vs forEach 的本质区别
├── 03-演示.md    # DataContainer + DataIterator
├── 04-场景.md    # Symbol.iterator、for...of、解构
└── 05-generator.md  # yield* 与生成器
```

#### 示例代码（Example）

**❌ 不推荐：暴露内部结构的 for 循环**

```ts
const arr = [10, 20, 30]
for (let i = 0; i < arr.length; i++) {  // 需要知道 .length
    console.log(arr[i])  // 需要知道 arr[i] 取值方式
}
```

**✅ 推荐写法：迭代器模式**

```ts
class DataIterator {
    private data: number[]
    private index = 0

    constructor(container: DataContainer) {
        this.data = container.data
    }

    next(): number | null {
        if (this.hasNext()) {
            return this.data[this.index++]
        }
        return null
    }

    hasNext(): boolean {
        return this.index < this.data.length
    }
}

class DataContainer {
    data: number[] = [10, 20, 30, 40]

    getIterator() {
        return new DataIterator(this)
    }
}

// 使用：不需要知道 data 的内部结构
const iterator = new DataContainer().getIterator()
while (iterator.hasNext()) {
    console.log(iterator.next())
}
```

#### JS 内置迭代器

JS 有序对象都内置 `Symbol.iterator`：

```ts
const arr = [10, 20, 30]
const iterator = arr[Symbol.iterator]()

iterator.next() // { value: 10, done: false }
iterator.next() // { value: 20, done: false }
iterator.next() // { value: 30, done: false }
iterator.next() // { value: undefined, done: true }
```

支持的有序结构：字符串、数组、NodeList、Map、Set、arguments

#### 迭代器的应用场景

- `for...of` 语法
- 数组解构 `const [a, b] = arr`
- 扩展运算符 `[...nodeList]`
- `Promise.all([...])` / `Promise.race([...])`

#### 权衡与代价（Trade-offs）

- **引入复杂度**：简单数组直接用 `for...of` 即可
- **不该用的场景**：数据结构简单且固定，不会更换

### 原型模式（Prototype Pattern）

#### 使用动机（Why）

- **传统定义**：用已有实例作为原型，通过复制创建新对象
- **JS 特殊性**：JS 对象本身就是基于原型的，原型模式的「克隆」在 JS 中不常用

#### 项目中的实现方式（How in this repo）

重点不是「克隆」，而是**理解 JS 原型链机制**：

```
design-pattern-wiki/08-原型模式/
├── 02-介绍和演示.md    # 传统克隆实现（JS 少用）
├── 03-原型和原型链.md  # 核心：prototype 和 __proto__
├── 04-场景.md         # Object.create()
└── 05-属性描述符.md    # defineProperty
```

#### 核心概念

```
┌─────────────────────────────────────────────────────────┐
│  函数/class 都有 prototype（显式原型）                    │
│  对象都有 __proto__（隐式原型）指向构造函数的 prototype    │
│  原型链：__proto__ → prototype → __proto__ → ...         │
└─────────────────────────────────────────────────────────┘
```

#### 示例代码（Example）

```ts
// class 是函数的语法糖，本质基于原型
class People {
    name: string
    constructor(name: string) { this.name = name }
    eat() { console.log(`${this.name} eat`) }
}

class Student extends People {
    school: string
    constructor(name: string, school: string) {
        super(name)
        this.school = school
    }
    study() { console.log(`${this.name} study`) }
}

const s1 = new Student('张三', '清华')
// s1.__proto__ === Student.prototype
// Student.prototype.__proto__ === People.prototype
```

#### 权衡与代价（Trade-offs）

- JS 开发者需要理解原型链，但**不需要刻意使用原型模式的克隆写法**
- `Object.create()` 可以创建指定原型的对象

### 装饰器模式（Decorator Pattern）

#### 使用动机（Why）

- **问题**：想给对象添加功能，但不想修改原有结构或使用继承
- **不用的后果**：修改原类代码，违反开放封闭原则；继承会导致类爆炸

#### 项目中的实现方式（How in this repo）

提供两种方式：
1. **传统包装类**：Decorator 类包装原对象
2. **ES/TS 装饰器语法**：`@decorator`

```
design-pattern-wiki/09-装饰器模式/
├── 02-介绍.md    # 手机壳比喻
├── 03-演示.md    # Circle + Decorator 包装
├── 04-场景.md    # @装饰器语法、React-Redux、Angular
└── 05-AOP.md     # 面向切面编程
```

#### 示例代码（Example）

**✅ 推荐写法：包装类装饰**

```ts
class Circle {
    draw() { console.log('画一个圆') }
}

class Decorator {
    private circle: Circle

    constructor(circle: Circle) {
        this.circle = circle
    }

    draw() {
        this.circle.draw()  // 原有功能
        this.setBorder()     // 新增功能
    }

    private setBorder() {
        console.log('设置边框颜色')
    }
}

const circle = new Circle()
const decorated = new Decorator(circle)
decorated.draw()  // 画一个圆 + 设置边框颜色
```

**✅ 推荐写法：ES/TS 装饰器语法**

```ts
// 方法装饰器
function log(target: any, key: string, descriptor: PropertyDescriptor) {
    const oldValue = descriptor.value

    descriptor.value = function () {
        console.log(`记录日志...`)  // 切面逻辑
        return oldValue.apply(this, arguments)  // 原业务逻辑
    }
}

class Foo {
    @log
    fn1() {
        console.log('业务功能1')
    }
}

new Foo().fn1()
// 输出：记录日志...
// 输出：业务功能1
```

#### AOP 面向切面编程

装饰器模式是实现 AOP 的最佳方式：将**横切关注点**（日志、权限、性能监控）与**业务逻辑**分离。

```
         ┌────────────┐
         │   日志切面   │  ← 装饰器
         └────────────┘
              │
    ┌─────────┼─────────┐
    │         │         │
┌───▼───┐ ┌───▼───┐ ┌───▼───┐
│ 业务A  │ │ 业务B  │ │ 业务C  │
└───────┘ └───────┘ └───────┘
```

#### 真实前端场景

| 框架 | 装饰器用法 |
|------|-----------|
| React-Redux | `@connect(mapState, mapDispatch)` |
| Angular | `@Component({ ... })` 定义组件 |
| MobX | `@observable`, `@action` |

#### 权衡与代价（Trade-offs）

- **引入复杂度**：多一层包装，调试时调用栈变深
- **TS 配置**：需要 `experimentalDecorators: true`
- **不该用的场景**：功能简单，直接在类中添加方法更清晰

### 代理模式（Proxy Pattern）

#### 使用动机（Why）

- **问题**：直接访问对象可能带来问题（远程访问、安全控制、性能开销）
- **不用的后果**：访问逻辑散落在调用方，无法统一控制

#### 项目中的实现方式（How in this repo）

区分：
1. **传统代理类**：ProxyImg 包装 RealImg
2. **ES6 Proxy**：拦截对象的 get/set 等操作

```
design-pattern-wiki/10-代理模式/
├── 02-介绍.md           # 房产中介、明星经纪人比喻
├── 03-演示.md           # ProxyImg 包装类
├── 05-Proxy的使用场景.md # Vue3 响应式、属性隐藏、验证
└── 06-Proxy的注意事项.md # Reflect 配合使用
```

#### 示例代码（Example）

**✅ 推荐写法：ES6 Proxy 拦截对象操作**

```ts
const user = { name: '张三', age: 25 }

const proxy = new Proxy(user, {
    get(target, key) {
        console.log('get...', key)
        return Reflect.get(target, key)
    },
    set(target, key, val) {
        console.log('set...', key, val)
        return Reflect.set(target, key, val)
    }
})

proxy.name = '李四'  // 输出：set... name 李四
console.log(proxy.name)  // 输出：get... name  →  李四
```

**✅ 实用场景：隐藏敏感属性**

```ts
const hiddenProps = ['password']
const user = { name: '张三', password: '123456' }

const proxy = new Proxy(user, {
    get(target, key) {
        if (hiddenProps.includes(key as string)) return undefined
        return Reflect.get(target, key)
    },
    has(target, key) {
        if (hiddenProps.includes(key as string)) return false
        return Reflect.has(target, key)
    }
})

console.log(proxy.password)  // undefined
console.log('password' in proxy)  // false
```

#### 代理模式 vs 装饰器模式

| 特征 | 代理模式 | 装饰器模式 |
|------|---------|-----------|
| 目的 | **控制访问** | **增强功能** |
| 关系 | 代理可能隐藏/保护原对象 | 装饰器依赖原对象 |
| 典型场景 | 权限控制、懒加载、缓存 | 日志、性能监控 |

#### 真实前端场景

- **Vue 3 响应式**：通过 Proxy 拦截 get/set 实现数据劫持
- **属性验证**：拦截 set 校验类型
- **实例记录**：拦截 construct 记录所有创建的实例

#### 权衡与代价（Trade-offs）

- **引入复杂度**：调试时需要注意代理层
- **兼容性**：ES6 Proxy 无法完美 polyfill，不支持 IE
- **不该用的场景**：不需要控制访问的简单对象

## 其他模式简述

### 职责链模式（Chain of Responsibility）

**核心思想**：请求沿着处理者链传递，每个处理者决定处理或传递。

**前端体现**：
- jQuery 链式调用：`$('#div').show().css('color', 'red').append($('#p'))`
- Promise 链：`.then().then().catch()`

### 策略模式（Strategy Pattern）

**核心思想**：将算法/策略封装成独立类，消除 `if...else` 分支。

```ts
// ❌ 不推荐：大量 if...else
class User {
    buy() {
        if (type === 'ordinary') { ... }
        if (type === 'member') { ... }
        if (type === 'vip') { ... }
    }
}

// ✅ 推荐：策略模式
interface IUser { buy: () => void }
class OrdinaryUser implements IUser { buy() { ... } }
class MemberUser implements IUser { buy() { ... } }
class VipUser implements IUser { buy() { ... } }
```

### 适配器模式（Adapter Pattern）

**核心思想**：转换接口格式，让不兼容的接口能协作。

**前端体现**：
- Vue computed：将 `userList` 适配为 `userNameList`
- 第三方 API 封装：统一不同 SDK 的调用方式

### MVC / MVVM

- **MVC**：View → Controller → Model → View
- **MVVM**：Vue 的核心架构
  - View = template
  - Model = data
  - VM = Vue 核心（双向绑定）

## 模式组合与协作

### 常见组合

| 组合 | 说明 | 示例 |
|------|------|------|
| 工厂 + 单例 | 工厂方法返回单例 | `Singleton.getInstance()` |
| 观察者 + 迭代器 | 遍历观察者列表通知 | Subject.notify() 内部 for...of |
| 代理 + 观察者 | Proxy 拦截 set 触发更新 | Vue 3 响应式原理 |
| 装饰器 + 职责链 | 多个装饰器叠加 | `@log @auth @cache method()` |

### 隐性模式

- **Vue `createApp`**：工厂模式
- **Vue 响应式**：代理模式 + 观察者模式
- **React Hooks**：策略模式（不同 hook 封装不同逻辑）

## 可迁移的通用设计原则

### SOLID 五大原则

- **S（单一职责）**：每个函数/类只做一件事，Promise 的每个 `.then()` 只处理一步
- **O（开放封闭）**：对扩展开放，对修改封闭 —— **软件设计的终极目标**
- **L（里氏替换）**：子类可以替换父类（前端较少用）
- **I（接口隔离）**：接口单一，避免"胖接口"（JS 无接口，体现较少）
- **D（依赖倒置）**：依赖抽象而非具体类

### 前端设计模式核心心法

1. **分离变化**：将会变化的部分（策略、观察者、创建逻辑）与不变的部分隔离
2. **面向接口**：`function fn(p: IPerson)` 而非 `function fn(p: Student)`
3. **组合优于继承**：装饰器包装 > 继承扩展
4. **最小知识原则**：调用方不需要知道内部结构（工厂、迭代器、代理）

## 个人读书笔记式总结

### 我从这个项目学到的设计思想

1. **「讲道理」的设计模式**
   - 设计模式不是玄学，而是纯理性思考的结果
   - 每个模式都在解决一个具体问题：创建（工厂/单例）、结构（装饰/代理/适配）、行为（观察者/迭代器/策略）

2. **开放封闭原则是「元原则」**
   - 项目中每个模式最后都会验证「是否符合开放封闭原则」
   - 这是判断设计好坏的终极标准

3. **JS 特有的模式表达**
   - 闭包实现单例（比 class private 更 JS 风格）
   - Proxy 实现代理（比包装类更强大）
   - Symbol.iterator 实现迭代器（语言内置支持）

4. **前端高频模式排序**
   - 观察者 > 工厂 > 单例 > 装饰器 > 代理 > 迭代器 > 原型
   - 观察者模式是 UI 编程的灵魂（DOM 事件、生命周期、响应式）

5. **不要为了模式而模式**
   - 项目只讲 7 种核心模式，不追求 23 种全覆盖
   - 简单场景直接写，复杂场景才考虑模式

### 适合记入 Notion/Obsidian 的金句

> "设计原则和设计模式都不难理解，它们是'讲道理'的。"

> "开放封闭原则是软件设计的终极目标：对扩展开放，对修改封闭。"

> "观察者模式是前端最常用的设计模式，也是 UI 编程最重要的思想。"

> "for 循环不是迭代器模式 —— 真正的迭代器隐藏内部结构。"

> "装饰器模式：手机还是那个手机，功能一点没变，只是在外面装饰了附加功能。"

## 附录：快速查阅表

| 模式 | 一句话定义 | 前端典型场景 | 核心类/API |
|------|-----------|-------------|-----------|
| 工厂 | 用函数创建对象，隐藏 new | jQuery `$()`, Vue/React createElement | Creator.create() |
| 单例 | 全局只有一个实例 | 登录框、Vuex store | getInstance() |
| 观察者 | 状态变化自动通知 | DOM 事件、Vue 生命周期 | attach(), notify() |
| 迭代器 | 顺序访问不暴露内部 | for...of, 解构 | next(), hasNext() |
| 原型 | 基于原型创建对象 | JS 原型链 | prototype, __proto__ |
| 装饰器 | 包装增强不改原结构 | @decorator, AOP | Decorator(target) |
| 代理 | 控制对原对象的访问 | Vue 3 响应式 | new Proxy(target, handler) |
