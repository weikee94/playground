// sub-app-b/app.js — 输入框子应用（Shadow DOM + 沙箱自动清理定时器 + 状态订阅）

let root = null;
let unsubTheme = null;
let unsubUser = null;
const fe = window.__microFE__;

export function mount(container, sandbox) {
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
    .sandbox-demo {
      margin-top: 16px;
      padding: 12px;
      background: #fefce8;
      border-radius: 8px;
      font-size: 13px;
      line-height: 1.8;
    }
    .dark .sandbox-demo { background: #713f12; }
    code { background: rgba(0,0,0,0.06); padding: 1px 4px; border-radius: 3px; font-size: 12px; }
  `;

  root.innerHTML = `
    <div class="card" id="card-b">
      <h2>App B (Input)</h2>
      <p>沙箱自动清理定时器 + 状态订阅</p>

      <div class="section">
        <input class="input" id="input-b" type="text" placeholder="试试输入..." />
        <p style="margin-top:10px; font-size:14px;">
          你输入的是: <strong id="output">...</strong>
        </p>
      </div>

      <div class="section">
        <div class="timer-bar">
          运行时间: <strong id="timer-val">0</strong> 秒
        </div>
      </div>

      <div class="section">
        <div class="user-display">
          从全局状态读取 user = <strong id="user-val">null</strong>
          （去 App A 修改，回来看变化）
        </div>
      </div>

      <div class="sandbox-demo">
        <strong>沙箱自动清理验证:</strong><br/>
        定时器通过 <code>sandbox.patchInterval()</code> 注册<br/>
        切换路由时沙箱自动 <code>clearInterval</code> → 不需要手动清理!<br/>
        打开 Console 看 unmount 日志
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

  // ====== 沙箱演示：定时器自动清理 ======
  // 用 sandbox.patchInterval 代替 setInterval
  // 切换路由时沙箱会自动 clearInterval，不需要手动清理！
  let seconds = 0;
  const timerEl = root.querySelector('#timer-val');
  if (sandbox) {
    sandbox.patchInterval(() => {
      seconds++;
      if (timerEl) timerEl.textContent = seconds;
    }, 1000);
  }

  // 订阅全局状态
  const userEl = root.querySelector('#user-val');
  const currentUser = fe.getState('user');
  userEl.textContent = currentUser ? `"${currentUser}"` : 'null';

  unsubUser = fe.subscribe('user', (val) => {
    userEl.textContent = val ? `"${val}"` : 'null';
  });

  unsubTheme = fe.subscribe('theme', (theme) => {
    root.querySelector('#card-b').classList.toggle('dark', theme === 'dark');
  });

  if (fe.getState('theme') === 'dark') {
    root.querySelector('#card-b').classList.add('dark');
  }

  return Promise.resolve();
}

export function unmount() {
  console.log('[App B] Unmounting...');
  // 注意：不再需要手动 clearInterval！沙箱会自动清理
  // 但状态订阅仍需手动取消（这是框架级别的，不是 window 副作用）
  if (unsubTheme) unsubTheme();
  if (unsubUser) unsubUser();
  unsubTheme = null;
  unsubUser = null;
  root = null;
  return Promise.resolve();
}
