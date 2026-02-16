// sub-app-a/app.js — 计数器子应用（Shadow DOM CSS 隔离 + 全局状态）

let root = null;
let unsubTheme = null;

export function mount(container) {
  console.log('[App A] Mounting...');

  root = document.createElement('div');

  // 样式写在 Shadow DOM 内部 → 完全隔离，不影响主应用和其他子应用
  const style = document.createElement('style');
  style.textContent = `
    :host { display: block; }
    .card {
      border: 2px solid #3b82f6;
      border-radius: 12px;
      padding: 24px;
      background: white;
    }
    .card.dark {
      background: #1e293b;
      color: #e2e8f0;
      border-color: #60a5fa;
    }
    h2 { color: #3b82f6; font-size: 20px; margin-bottom: 16px; }
    .dark h2 { color: #60a5fa; }
    .button {
      padding: 10px 24px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.2s;
    }
    .button:hover { background: #2563eb; }
    .section { margin-top: 20px; }
    .info {
      margin-top: 16px;
      padding: 12px;
      background: #f0f9ff;
      border-radius: 8px;
      font-size: 13px;
      line-height: 1.8;
    }
    .dark .info { background: #1e3a5f; }
    .state-controls {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .state-btn {
      padding: 6px 14px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background: white;
      cursor: pointer;
      font-size: 13px;
    }
    .state-btn:hover { background: #f3f4f6; }
    .dark .state-btn { background: #334155; color: #e2e8f0; border-color: #475569; }
    .dark .state-btn:hover { background: #475569; }
  `;

  root.innerHTML = `
    <div class="card" id="card-a">
      <h2>App A (Counter)</h2>
      <p>独立子应用 — Shadow DOM CSS 隔离</p>

      <div class="section">
        <button class="button" id="btn-count">
          点击计数: <span id="count">0</span>
        </button>
      </div>

      <div class="section">
        <p style="font-size:13px; color:#666; margin-bottom:8px;">修改全局状态:</p>
        <div class="state-controls">
          <button class="state-btn" id="btn-user-a">user = "Alice"</button>
          <button class="state-btn" id="btn-user-b">user = "Bob"</button>
          <button class="state-btn" id="btn-theme">切换 theme</button>
        </div>
      </div>

      <div class="info">
        <strong>CSS 隔离验证:</strong><br/>
        主应用有 <code>.button { background: green !important }</code><br/>
        但这里的按钮依然是蓝色 → Shadow DOM 生效
      </div>
    </div>
  `;

  container.appendChild(style);
  container.appendChild(root);

  // 计数器
  let count = 0;
  const countEl = root.querySelector('#count');
  root.querySelector('#btn-count').onclick = () => {
    count++;
    countEl.textContent = count;
  };

  // 修改全局状态
  root.querySelector('#btn-user-a').onclick = () => MiniSPA.setState('user', 'Alice');
  root.querySelector('#btn-user-b').onclick = () => MiniSPA.setState('user', 'Bob');
  root.querySelector('#btn-theme').onclick = () => {
    const current = MiniSPA.getState('theme');
    MiniSPA.setState('theme', current === 'light' ? 'dark' : 'light');
  };

  // 订阅 theme 状态
  unsubTheme = MiniSPA.subscribe('theme', (theme) => {
    const card = root.querySelector('#card-a');
    card.classList.toggle('dark', theme === 'dark');
  });

  // 初始化 theme
  const currentTheme = MiniSPA.getState('theme');
  if (currentTheme === 'dark') {
    root.querySelector('#card-a').classList.add('dark');
  }

  return Promise.resolve();
}

export function unmount() {
  console.log('[App A] Unmounting...');
  if (unsubTheme) unsubTheme();
  unsubTheme = null;
  root = null;
  return Promise.resolve();
}
