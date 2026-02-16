// sub-app-b/app.js — 输入框子应用（Shadow DOM CSS 隔离 + 定时器清理 + 状态订阅）

let root = null;
let timer = null;
let unsubTheme = null;
let unsubUser = null;

export function mount(container) {
  console.log('[App B] Mounting...');

  root = document.createElement('div');

  const style = document.createElement('style');
  style.textContent = `
    :host { display: block; }
    .card {
      border: 2px solid #ef4444;
      border-radius: 12px;
      padding: 24px;
      background: white;
    }
    .card.dark {
      background: #1e293b;
      color: #e2e8f0;
      border-color: #f87171;
    }
    h2 { color: #ef4444; font-size: 20px; margin-bottom: 16px; }
    .dark h2 { color: #f87171; }
    .input {
      padding: 10px 14px;
      border: 2px solid #ef4444;
      border-radius: 8px;
      width: 100%;
      max-width: 320px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }
    .input:focus { border-color: #dc2626; }
    .dark .input { background: #334155; color: #e2e8f0; border-color: #f87171; }
    .section { margin-top: 20px; }
    .timer-bar {
      padding: 12px;
      background: #fef2f2;
      border-radius: 8px;
      font-size: 13px;
    }
    .dark .timer-bar { background: #4c1d1d; }
    .info {
      margin-top: 16px;
      padding: 12px;
      background: #f0f9ff;
      border-radius: 8px;
      font-size: 13px;
      line-height: 1.8;
    }
    .dark .info { background: #1e3a5f; }
    .user-display {
      padding: 8px 14px;
      background: #fef3c7;
      border-radius: 8px;
      font-size: 13px;
    }
    .dark .user-display { background: #78350f; }
  `;

  root.innerHTML = `
    <div class="card" id="card-b">
      <h2>App B (Input)</h2>
      <p>独立子应用 — 定时器清理 + 状态订阅</p>

      <div class="section">
        <input class="input" id="input-b" type="text" placeholder="试试输入..." />
        <p style="margin-top:10px; font-size:14px;">
          你输入的是: <strong id="output">...</strong>
        </p>
      </div>

      <div class="section">
        <div class="timer-bar">
          运行时间: <strong id="timer-val">0</strong> 秒
          （切换路由后会自动清理）
        </div>
      </div>

      <div class="section">
        <div class="user-display">
          从全局状态读取 user = <strong id="user-val">null</strong>
          （去 App A 修改，回来看变化）
        </div>
      </div>

      <div class="info">
        <strong>状态隔离验证:</strong><br/>
        App A 和 App B 各自有独立的局部状态（count / input / timer）<br/>
        全局状态 (user, theme) 通过 MiniSPA.setState/subscribe 共享
      </div>
    </div>
  `;

  container.appendChild(style);
  container.appendChild(root);

  // 双向绑定
  const input = root.querySelector('#input-b');
  const output = root.querySelector('#output');
  input.oninput = (e) => {
    output.textContent = e.target.value || '...';
  };

  // 定时器（unmount 时必须清理）
  let seconds = 0;
  const timerEl = root.querySelector('#timer-val');
  timer = setInterval(() => {
    seconds++;
    timerEl.textContent = seconds;
  }, 1000);

  // 订阅全局状态
  const userEl = root.querySelector('#user-val');
  const currentUser = MiniSPA.getState('user');
  userEl.textContent = currentUser ? `"${currentUser}"` : 'null';

  unsubUser = MiniSPA.subscribe('user', (val) => {
    userEl.textContent = val ? `"${val}"` : 'null';
  });

  unsubTheme = MiniSPA.subscribe('theme', (theme) => {
    root.querySelector('#card-b').classList.toggle('dark', theme === 'dark');
  });

  if (MiniSPA.getState('theme') === 'dark') {
    root.querySelector('#card-b').classList.add('dark');
  }

  return Promise.resolve();
}

export function unmount() {
  console.log('[App B] Unmounting...');

  // 清理定时器
  if (timer) {
    clearInterval(timer);
    timer = null;
  }

  // 取消状态订阅
  if (unsubTheme) unsubTheme();
  if (unsubUser) unsubUser();
  unsubTheme = null;
  unsubUser = null;
  root = null;

  return Promise.resolve();
}
