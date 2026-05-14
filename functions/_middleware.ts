/**
 * Cloudflare Pages 边缘中间件
 * 在服务器端拦截所有请求，检查维护模式和 IP 封禁
 * 这段代码运行在 Cloudflare 的服务器上，不受浏览器缓存影响
 */

interface Env {
  SITE_CONFIG: KVNamespace;
}

// 维护页面 HTML（直接从服务器返回，不依赖前端代码）
const maintenanceHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>网站维护中</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Microsoft YaHei', sans-serif;
      background: #f4f4f4;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    .container {
      text-align: center;
      background: white;
      padding: 60px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      max-width: 500px;
    }
    .icon { font-size: 72px; margin-bottom: 24px; }
    h1 { color: #333; font-size: 28px; margin-bottom: 16px; }
    p { color: #666; font-size: 16px; line-height: 1.8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">🚧</div>
    <h1>网站维护中</h1>
    <p>我们正在对系统进行升级维护，暂时无法访问。<br>给您带来的不便敬请谅解，请稍后再试。</p>
  </div>
</body>
</html>`;

// IP 被封禁时的页面
const blockedHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>访问受限</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Microsoft YaHei', sans-serif;
      background: #f4f4f4;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    .container {
      text-align: center;
      background: white;
      padding: 60px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      max-width: 500px;
    }
    .icon { font-size: 72px; margin-bottom: 24px; }
    h1 { color: #e1251b; font-size: 28px; margin-bottom: 16px; }
    p { color: #666; font-size: 16px; line-height: 1.8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">🚫</div>
    <h1>访问受限</h1>
    <p>您的访问权限已被限制。<br>如有疑问，请联系管理员。</p>
  </div>
</body>
</html>`;

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, next } = context;
  const url = new URL(request.url);

  // 放行管理员相关请求（API 和管理面板页面本身）
  if (url.pathname.startsWith('/api/admin') || url.pathname.startsWith('/admin')) {
    return next();
  }

  // 如果 KV 没有绑定，直接放行（首次部署时 KV 可能还没配置）
  if (!env.SITE_CONFIG) {
    return next();
  }

  try {
    // 获取访问者的真实 IP
    const visitorIP = request.headers.get('cf-connecting-ip') || 'unknown';

    // 检查 1：维护模式是否开启
    const maintenanceMode = await env.SITE_CONFIG.get('maintenance_mode');
    if (maintenanceMode === 'true') {
      return new Response(maintenanceHTML, {
        status: 503,
        headers: {
          'Content-Type': 'text/html;charset=UTF-8',
          'Cache-Control': 'no-store',  // 禁止缓存维护页面
        },
      });
    }

    // 检查 2：该 IP 是否被封禁
    const bannedIPsRaw = await env.SITE_CONFIG.get('banned_ips');
    if (bannedIPsRaw) {
      const bannedIPs: string[] = JSON.parse(bannedIPsRaw);
      if (bannedIPs.includes(visitorIP)) {
        return new Response(blockedHTML, {
          status: 403,
          headers: {
            'Content-Type': 'text/html;charset=UTF-8',
            'Cache-Control': 'no-store',
          },
        });
      }
    }

    // 检查 3：记录访问日志（最近 200 条）
    const logEntry = JSON.stringify({
      ip: visitorIP,
      path: url.pathname,
      time: new Date().toISOString(),
      ua: request.headers.get('user-agent') || '',
    });
    const existingLogs = await env.SITE_CONFIG.get('access_logs');
    const logs: string[] = existingLogs ? JSON.parse(existingLogs) : [];
    logs.unshift(logEntry);
    if (logs.length > 200) logs.length = 200;
    // 写入日志（不阻塞请求）
    context.waitUntil(env.SITE_CONFIG.put('access_logs', JSON.stringify(logs)));

  } catch (e) {
    // KV 出错时不影响正常访问
    console.error('Middleware error:', e);
  }

  return next();
};
