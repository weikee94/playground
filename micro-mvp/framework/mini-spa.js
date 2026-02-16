// framework/mini-spa.js
// 微前端框架 MVP — 路由劫持 + 动态加载 + 生命周期 + CSS隔离(Shadow DOM) + 状态管理

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
        await app.instance.mount(mountTarget);
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
