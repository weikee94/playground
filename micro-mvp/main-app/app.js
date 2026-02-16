// main-app/app.js — 注册子应用 + 启动框架
const fe = window.__microFE__;

// 初始化全局状态
fe.setState('user', null);
fe.setState('theme', 'light');

// 监听全局状态 → 更新顶栏
fe.subscribe('user', (val) => {
  document.getElementById('state-user').textContent = val ? `"${val}"` : 'null';
});
fe.subscribe('theme', (val) => {
  document.getElementById('state-theme').textContent = val;
});

// 注册首页
fe.registerApp({
  name: 'home',
  activeWhen: (path) => path === '/',
  useShadow: false,
  app: () =>
    Promise.resolve({
      mount: (container) => {
        container.innerHTML = `
          <div style="text-align:center; padding:60px 20px;">
            <h2 style="font-size:24px; color:#1a1a2e;">Micro Frontend MVP</h2>
            <p style="color:#666; margin-top:12px; font-size:14px;">
              路由劫持 + 动态加载 + 生命周期 + CSS隔离(Shadow DOM) + 状态管理
            </p>
            <div style="margin-top:40px; display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
              <a href="#/app-a" style="padding:10px 24px; background:#3b82f6; color:white; border-radius:8px; text-decoration:none; font-size:14px;">App A (Counter)</a>
              <a href="#/app-b" style="padding:10px 24px; background:#ef4444; color:white; border-radius:8px; text-decoration:none; font-size:14px;">App B (Input)</a>
            </div>
            <p style="margin-top:32px; font-size:12px; color:#999;">
              打开 DevTools Console 查看生命周期日志
            </p>
          </div>
        `;
      },
      unmount: () => {},
    }),
});

// 注册 App A
fe.registerApp({
  name: 'app-a',
  activeWhen: '/app-a',
  useShadow: true,
  app: () => import('../sub-app-a/app.js'),
});

// 注册 App B
fe.registerApp({
  name: 'app-b',
  activeWhen: '/app-b',
  useShadow: true,
  app: () => import('../sub-app-b/app.js'),
});

// 启动
fe.start();

// 导航高亮
function updateNav() {
  document.querySelectorAll('.nav a').forEach((a) => {
    a.classList.toggle('active', a.getAttribute('href') === window.location.hash);
  });
}
window.addEventListener('hashchange', updateNav);
updateNav();
