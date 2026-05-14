import React, { useState, useEffect, useCallback } from 'react';
import styles from './AdminPage.module.css';

interface LogEntry {
  ip: string;
  path: string;
  time: string;
  device: string;
  ua: string;
}

interface SiteStatus {
  maintenance_mode: boolean;
  banned_ips: string[];
}

const API_BASE = '/api/admin';

const AdminPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [status, setStatus] = useState<SiteStatus | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [banIP, setBanIP] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const headers = useCallback(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }), [token]);

  // 登录
  const handleLogin = async () => {
    setLoginError('');
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        setIsLoggedIn(true);
        localStorage.setItem('admin_token', data.token);
      } else {
        setLoginError(data.error || '登录失败');
      }
    } catch {
      setLoginError('网络错误，请检查连接');
    }
  };

  // 获取状态
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/status`, { headers: headers() });
      if (res.status === 401) { setIsLoggedIn(false); return; }
      const data = await res.json();
      setStatus(data);
    } catch (e) {
      console.error(e);
    }
  }, [headers]);

  // 获取日志
  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/logs`, { headers: headers() });
      if (res.status === 401) { setIsLoggedIn(false); return; }
      const data = await res.json();
      const parsed = data.logs.map((log: string | LogEntry) =>
        typeof log === 'string' ? JSON.parse(log) : log
      );
      setLogs(parsed);
    } catch (e) {
      console.error(e);
    }
  }, [headers]);

  // 开关维护模式
  const toggleMaintenance = async () => {
    if (!status) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/maintenance`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ enabled: !status.maintenance_mode }),
      });
      const data = await res.json();
      showMessage(data.message);
      fetchStatus();
    } catch {
      showMessage('操作失败');
    }
    setLoading(false);
  };

  // 封禁 IP
  const handleBan = async () => {
    if (!banIP.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ban`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ ip: banIP.trim() }),
      });
      const data = await res.json();
      showMessage(data.message);
      setBanIP('');
      fetchStatus();
    } catch {
      showMessage('操作失败');
    }
    setLoading(false);
  };

  // 解封 IP
  const handleUnban = async (ip: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/unban`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ ip }),
      });
      const data = await res.json();
      showMessage(data.message);
      fetchStatus();
    } catch {
      showMessage('操作失败');
    }
    setLoading(false);
  };

  // 清空日志
  const clearLogs = async () => {
    try {
      await fetch(`${API_BASE}/logs`, { method: 'DELETE', headers: headers() });
      showMessage('日志已清空');
      setLogs([]);
    } catch {
      showMessage('操作失败');
    }
  };

  // 一键封禁日志中的 IP
  const banFromLog = async (ip: string) => {
    setBanIP(ip);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ban`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ ip }),
      });
      const data = await res.json();
      showMessage(data.message);
      fetchStatus();
    } catch {
      showMessage('操作失败');
    }
    setLoading(false);
  };

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  // 自动登录（如果有缓存的 token）
  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
      setToken(savedToken);
      setIsLoggedIn(true);
    }
  }, []);

  // 登录后加载数据
  useEffect(() => {
    if (isLoggedIn) {
      fetchStatus();
      fetchLogs();
    }
  }, [isLoggedIn, fetchStatus, fetchLogs]);

  // 未登录，显示登录界面
  if (!isLoggedIn) {
    return (
      <div className={styles.loginWrapper}>
        <div className={styles.loginCard}>
          <div className={styles.loginIcon}>🔐</div>
          <h1>管理后台</h1>
          <p className={styles.loginHint}>请输入管理员密码</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="管理员密码"
            className={styles.loginInput}
          />
          {loginError && <p className={styles.error}>{loginError}</p>}
          <button onClick={handleLogin} className={styles.loginBtn}>登 录</button>
        </div>
      </div>
    );
  }

  // 已登录，显示管理面板
  return (
    <div className={styles.adminWrapper}>
      {message && <div className={styles.toast}>{message}</div>}

      <header className={styles.adminHeader}>
        <h1>📊 网站管理后台</h1>
        <button
          onClick={() => { setIsLoggedIn(false); setToken(''); localStorage.removeItem('admin_token'); }}
          className={styles.logoutBtn}
        >
          退出登录
        </button>
      </header>

      <div className={styles.dashboard}>
        {/* 网站状态卡片 */}
        <div className={styles.card}>
          <h2>🌐 网站状态</h2>
          <div className={styles.statusRow}>
            <span>当前状态：</span>
            <span className={status?.maintenance_mode ? styles.statusOff : styles.statusOn}>
              {status?.maintenance_mode ? '🔴 维护中（已关闭访问）' : '🟢 正常运行中'}
            </span>
          </div>
          <button
            onClick={toggleMaintenance}
            disabled={loading}
            className={status?.maintenance_mode ? styles.btnGreen : styles.btnRed}
          >
            {loading ? '处理中...' : status?.maintenance_mode ? '✅ 开启网站' : '⛔ 关闭网站'}
          </button>
          <p className={styles.hint}>
            {status?.maintenance_mode
              ? '点击"开启网站"后，所有用户将立刻恢复访问'
              : '点击"关闭网站"后，所有用户将立刻无法访问（不受缓存影响）'}
          </p>
        </div>

        {/* IP 封禁管理 */}
        <div className={styles.card}>
          <h2>🚫 IP 封禁管理</h2>
          <div className={styles.banInputRow}>
            <input
              type="text"
              value={banIP}
              onChange={(e) => setBanIP(e.target.value)}
              placeholder="输入要封禁的 IP 地址"
              className={styles.banInput}
            />
            <button onClick={handleBan} disabled={loading} className={styles.btnRed}>
              封禁
            </button>
          </div>
          {status && status.banned_ips.length > 0 ? (
            <div className={styles.bannedList}>
              <h3>已封禁的 IP（{status.banned_ips.length}个）</h3>
              {status.banned_ips.map((ip) => (
                <div key={ip} className={styles.bannedItem}>
                  <code>{ip}</code>
                  <button onClick={() => handleUnban(ip)} className={styles.btnSmall}>解封</button>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.hint}>暂无封禁记录</p>
          )}
        </div>

        {/* 访问日志 */}
        <div className={`${styles.card} ${styles.logCard}`}>
          <div className={styles.logHeader}>
            <h2>📋 访问日志（最近 200 条）</h2>
            <div>
              <button onClick={fetchLogs} className={styles.btnBlue}>刷新</button>
              <button onClick={clearLogs} className={styles.btnGray}>清空</button>
            </div>
          </div>
          {logs.length > 0 ? (
            <div className={styles.logTable}>
              <table>
                <thead>
                  <tr>
                    <th>时间</th>
                    <th>IP 地址</th>
                    <th>设备</th>
                    <th>访问路径</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => (
                    <tr key={i}>
                      <td>{new Date(log.time).toLocaleString('zh-CN')}</td>
                      <td><code>{log.ip}</code></td>
                      <td>{log.device || '—'}</td>
                      <td>{log.path}</td>
                      <td>
                        <button
                          onClick={() => banFromLog(log.ip)}
                          className={styles.btnSmallRed}
                          title="封禁此 IP"
                        >
                          封禁
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={styles.hint}>暂无访问记录</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
