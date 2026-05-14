/**
 * 管理员 API 接口
 * 提供维护模式开关、IP 封禁管理、访问日志查看功能
 * 所有操作都需要管理员密码验证
 */

interface Env {
  SITE_CONFIG: KVNamespace;
}

// ⚠️ 管理员密码 - 请修改为您自己的密码！
const ADMIN_PASSWORD = 'admin888';

// 验证管理员身份
function verifyAdmin(request: Request): boolean {
  const auth = request.headers.get('Authorization');
  if (!auth) return false;
  const token = auth.replace('Bearer ', '');
  return token === ADMIN_PASSWORD;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);

  // CORS 支持（允许管理面板从其他域名调用）
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'no-store',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // 验证密码（登录接口除外）
  if (url.pathname !== '/api/admin/login') {
    if (!verifyAdmin(request)) {
      return new Response(JSON.stringify({ error: '未授权，请先登录' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  if (!env.SITE_CONFIG) {
    return new Response(JSON.stringify({ error: 'KV 数据库未绑定，请先在 Cloudflare 控制台完成配置' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const path = url.pathname;

    // ============ 登录验证 ============
    if (path === '/api/admin/login' && request.method === 'POST') {
      const body = await request.json() as { password: string };
      if (body.password === ADMIN_PASSWORD) {
        return new Response(JSON.stringify({ success: true, token: ADMIN_PASSWORD }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: '密码错误' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============ 获取当前状态 ============
    if (path === '/api/admin/status' && request.method === 'GET') {
      const maintenance = await env.SITE_CONFIG.get('maintenance_mode');
      const bannedRaw = await env.SITE_CONFIG.get('banned_ips');
      const banned = bannedRaw ? JSON.parse(bannedRaw) : [];
      return new Response(JSON.stringify({
        maintenance_mode: maintenance === 'true',
        banned_ips: banned,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============ 开关维护模式 ============
    if (path === '/api/admin/maintenance' && request.method === 'POST') {
      const body = await request.json() as { enabled: boolean };
      await env.SITE_CONFIG.put('maintenance_mode', String(body.enabled));
      return new Response(JSON.stringify({
        success: true,
        maintenance_mode: body.enabled,
        message: body.enabled ? '维护模式已开启，网站已关闭访问' : '维护模式已关闭，网站已恢复访问',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============ 封禁 IP ============
    if (path === '/api/admin/ban' && request.method === 'POST') {
      const body = await request.json() as { ip: string };
      const bannedRaw = await env.SITE_CONFIG.get('banned_ips');
      const banned: string[] = bannedRaw ? JSON.parse(bannedRaw) : [];
      if (!banned.includes(body.ip)) {
        banned.push(body.ip);
        await env.SITE_CONFIG.put('banned_ips', JSON.stringify(banned));
      }
      return new Response(JSON.stringify({
        success: true,
        message: `IP ${body.ip} 已被封禁`,
        banned_ips: banned,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============ 解封 IP ============
    if (path === '/api/admin/unban' && request.method === 'POST') {
      const body = await request.json() as { ip: string };
      const bannedRaw = await env.SITE_CONFIG.get('banned_ips');
      let banned: string[] = bannedRaw ? JSON.parse(bannedRaw) : [];
      banned = banned.filter(ip => ip !== body.ip);
      await env.SITE_CONFIG.put('banned_ips', JSON.stringify(banned));
      return new Response(JSON.stringify({
        success: true,
        message: `IP ${body.ip} 已被解封`,
        banned_ips: banned,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============ 查看访问日志 ============
    if (path === '/api/admin/logs' && request.method === 'GET') {
      const logsRaw = await env.SITE_CONFIG.get('access_logs');
      const logs = logsRaw ? JSON.parse(logsRaw) : [];
      return new Response(JSON.stringify({ logs }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============ 清空日志 ============
    if (path === '/api/admin/logs' && request.method === 'DELETE') {
      await env.SITE_CONFIG.put('access_logs', '[]');
      return new Response(JSON.stringify({ success: true, message: '日志已清空' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: '接口不存在' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: '服务器内部错误' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};
