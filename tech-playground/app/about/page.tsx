export default function AboutPage() {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '16px',
      padding: '3rem',
      maxWidth: '900px',
      margin: '0 auto',
      lineHeight: '1.8',
    }}>
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '2rem',
      }}>
        关于技术游乐场
      </h1>

      <div style={{ color: '#555', fontSize: '1.05rem' }}>
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#667eea', marginBottom: '1rem' }}>
            🎯 这是什么?
          </h2>
          <p>
            这是一个技术知识库 + 实验场,记录我在技术探索路上的学习笔记、实验过程和踩坑经验。
          </p>
          <p style={{ marginTop: '1rem' }}>
            不同于传统的技术博客,这里更像一个「游乐场」—— 强调探索的乐趣、实验的过程,而不仅仅是结果。
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#667eea', marginBottom: '1rem' }}>
            🎨 设计理念
          </h2>
          <ul style={{ paddingLeft: '1.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>探索优先</strong>: 记录学习过程,不只是最终结论
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>实验驱动</strong>: 用实际代码和 demo 验证想法
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>可视化</strong>: 用图表、动画让抽象概念具象化
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>渐进式</strong>: 从简单版本开始,持续迭代升级
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#667eea', marginBottom: '1rem' }}>
            🚀 技术栈
          </h2>
          <ul style={{ paddingLeft: '1.5rem' }}>
            <li><strong>框架</strong>: Next.js 14 (App Router)</li>
            <li><strong>语言</strong>: TypeScript</li>
            <li><strong>部署</strong>: Vercel</li>
            <li><strong>内容</strong>: Markdown</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#667eea', marginBottom: '1rem' }}>
            📋 实验标记系统
          </h2>
          <div style={{
            background: '#f8f9fa',
            padding: '1.5rem',
            borderRadius: '8px',
            marginTop: '1rem',
          }}>
            <div style={{ marginBottom: '0.8rem' }}>
              <span style={{ fontSize: '1.2rem' }}>🧪</span> <strong>实验中</strong> - 还在探索,结论可能不准确
            </div>
            <div style={{ marginBottom: '0.8rem' }}>
              <span style={{ fontSize: '1.2rem' }}>✅</span> <strong>已验证</strong> - 在实际项目中用过,靠谱
            </div>
            <div style={{ marginBottom: '0.8rem' }}>
              <span style={{ fontSize: '1.2rem' }}>💡</span> <strong>灵感</strong> - 有趣的想法,待验证
            </div>
            <div style={{ marginBottom: '0.8rem' }}>
              <span style={{ fontSize: '1.2rem' }}>🔥</span> <strong>踩坑记录</strong> - 血泪教训,避免重复踩坑
            </div>
            <div>
              <span style={{ fontSize: '1.2rem' }}>🚀</span> <strong>最佳实践</strong> - 经过验证的最优方案
            </div>
          </div>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#667eea', marginBottom: '1rem' }}>
            🎯 未来计划
          </h2>
          <div style={{ paddingLeft: '1.5rem' }}>
            <p><strong>短期 (1-2 个月)</strong></p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
              <li>添加搜索功能</li>
              <li>代码高亮优化</li>
              <li>深色模式</li>
              <li>随机笔记功能</li>
            </ul>

            <p><strong>中期 (3-6 个月)</strong></p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
              <li>交互式代码编辑器</li>
              <li>技术树可视化</li>
              <li>学习统计面板</li>
            </ul>

            <p><strong>长期 (6+ 个月)</strong></p>
            <ul style={{ paddingLeft: '1.5rem' }}>
              <li>AI 问答助手</li>
              <li>知识图谱可视化</li>
              <li>微前端架构重构</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1.8rem', color: '#667eea', marginBottom: '1rem' }}>
            💌 联系方式
          </h2>
          <p>
            如果你对这个项目感兴趣,或者有任何建议,欢迎通过以下方式联系:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>
            <li>GitHub Issues</li>
            <li>Pull Requests</li>
          </ul>
        </section>
      </div>

      <div style={{
        marginTop: '3rem',
        padding: '1.5rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        color: 'white',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
          "让技术学习变得有趣,把知识库变成游乐场"
        </p>
        <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>
          —— 探索、实验、记录、分享
        </p>
      </div>
    </div>
  )
}
