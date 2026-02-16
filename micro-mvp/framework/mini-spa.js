// framework/mini-spa.js
// 微前端框架 MVP — 路由劫持 + 动态加载 + 生命周期 + CSS隔离 + Proxy沙箱 + 状态管理

// ==================== Proxy 沙箱 ====================
// 原理：给每个子应用一个"假 window"
// 写入操作 → 存到 fakeWindow（不污染真 window）
// 读取操作 → 先查 fakeWindow，没有则回退到真 window
// 副作用自动记录 → unmount 时自动清理（定时器、事件监听）

class Sandbox {
  constructor(name) {
    this.name = name;
    this._active = false;
    this._fakeWindow = {};       // 子应用写入的全局变量存在这里
    this._timers = [];           // 记录 setInterval/setTimeout
    this._listeners = [];        // 记录 addEventListener

    // 核心：用 Proxy 拦截所有读写
    this.proxy = new Proxy(this._fakeWindow, {
      get: (target, key) => {
        // 特殊属性：返回 proxy 自身（某些库会检查 window.window）
        if (key === 'window' || key === 'self' || key === 'globalThis') {
          return this.proxy;
        }

        // 先从 fakeWindow 找，找不到就从真 window 找
        if (key in target) {
          return target[key];
        }

        const val = window[key];
        // 如果是函数，绑定到真 window（否则某些原生 API 会报 Illegal invocation）
        if (typeof val === 'function' && !val.prototype) {
          return val.bind(window);
        }
        return val;
      },

      set: (target, key, value) => {
        // 所有写入都存到 fakeWindow，不污染真 window
        target[key] = value;
        console.log(`[Sandbox:${this.name}] set ${String(key)} →`, value);
        return true;
      },

      has: (target, key) => {
        return key in target || key in window;
      },
    });
  }

  // 劫持 setInterval — 自动记录，unmount 时自动清理
  patchInterval(fn, ms) {
    const id = setInterval(fn, ms);
    this._timers.push({ type: 'interval', id });
    return id;
  }

  // 劫持 setTimeout — 自动记录
  patchTimeout(fn, ms) {
    const id = setTimeout(fn, ms);
    this._timers.push({ type: 'timeout', id });
    return id;
  }

  // 劫持 addEventListener — 自动记录
  patchAddEventListener(target, event, handler, options) {
    target.addEventListener(event, handler, options);
    this._listeners.push({ target, event, handler, options });
  }

  // 激活沙箱
  activate() {
    this._active = true;
    console.log(`[Sandbox:${this.name}] activated`);
  }

  // 停用沙箱 + 自动清理所有副作用
  deactivate() {
    this._active = false;

    // 清理所有定时器
    this._timers.forEach(({ type, id }) => {
      if (type === 'interval') clearInterval(id);
      else clearTimeout(id);
    });
    console.log(`[Sandbox:${this.name}] cleared ${this._timers.length} timer(s)`);
    this._timers = [];

    // 清理所有事件监听
    this._listeners.forEach(({ target, event, handler, options }) => {
      target.removeEventListener(event, handler, options);
    });
    console.log(`[Sandbox:${this.name}] removed ${this._listeners.length} listener(s)`);
    this._listeners = [];

    console.log(`[Sandbox:${this.name}] deactivated, fakeWindow keys:`, Object.keys(this._fakeWindow));
  }
}

// ==================== 框架核心 ====================

class MicroFE {
  constructor() {
    this.apps = [];
    this.currentApp = null;
    this._state = {};
    this._listeners = new Map();
  }

  // ==================== 应用注册 ====================

  registerApp(config) {
    this.apps.push({
      name: config.name,
      activeWhen: config.activeWhen,
      loadApp: config.app,
      container: config.container || '#app',
      useShadow: config.useShadow !== false,
      sandbox: config.sandbox !== false ? new Sandbox(config.name) : null,
      instance: null,
      shadowRoot: null,
    });
  }

  // ==================== 路由 ====================

  start() {
    window.addEventListener('hashchange', () => this.reroute());
    window.addEventListener('popstate', () => this.reroute());
    this.reroute();
  }

  async reroute() {
    const path = window.location.hash.slice(1) || '/';
    const target = this.apps.find((app) => this._isActive(app.activeWhen, path));

    if (this.currentApp && this.currentApp !== target) {
      await this._unmount(this.currentApp);
    }

    if (target) {
      await this._mount(target);
      this.currentApp = target;
    }
  }

  _isActive(rule, path) {
    if (typeof rule === 'function') return rule(path);
    if (typeof rule === 'string') return path.startsWith(rule);
    return false;
  }

  // ==================== 生命周期 ====================

  async _mount(app) {
    try {
      if (!app.instance) {
        console.log(`[MicroFE] Loading ${app.name}...`);
        app.instance = await app.loadApp();
      }

      // 激活沙箱
      if (app.sandbox) app.sandbox.activate();

      console.log(`[MicroFE] Mounting ${app.name}`);
      const host = document.querySelector(app.container);

      let mountTarget;
      if (app.useShadow) {
        const wrapper = document.createElement('div');
        wrapper.id = `micro-${app.name}`;
        host.appendChild(wrapper);
        app.shadowRoot = wrapper.attachShadow({ mode: 'open' });
        mountTarget = app.shadowRoot;
      } else {
        mountTarget = host;
      }

      if (app.instance.mount) {
        // 把沙箱传给子应用，子应用可以用 sandbox.proxy 代替 window
        await app.instance.mount(mountTarget, app.sandbox);
      }
    } catch (err) {
      console.error(`[MicroFE] Mount failed for ${app.name}:`, err);
      const host = document.querySelector(app.container);
      if (host) {
        host.innerHTML = `<div style="color:red; padding:20px;">Load failed: ${err.message}</div>`;
      }
    }
  }

  async _unmount(app) {
    console.log(`[MicroFE] Unmounting ${app.name}`);
    if (app.instance?.unmount) {
      await app.instance.unmount();
    }

    // 停用沙箱 → 自动清理定时器、事件监听
    if (app.sandbox) app.sandbox.deactivate();

    const host = document.querySelector(app.container);
    if (host) host.innerHTML = '';
    app.shadowRoot = null;
  }

  // ==================== 状态管理 ====================

  setState(key, value) {
    this._state[key] = value;
    const fns = this._listeners.get(key);
    if (fns) fns.forEach((fn) => fn(value));
  }

  getState(key) {
    return this._state[key];
  }

  subscribe(key, fn) {
    if (!this._listeners.has(key)) this._listeners.set(key, new Set());
    this._listeners.get(key).add(fn);
    return () => this._listeners.get(key)?.delete(fn);
  }
}

window.__microFE__ = new MicroFE();
