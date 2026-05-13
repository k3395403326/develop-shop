import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import styles from './Header.module.css';

const hotWords = ['滚筒洗衣机', '生日礼物', '按摩器', '化妆品', '零食大礼包', '全麦面包', '冰丝凉席', '篮球鞋', '花露水', '电瓶车', '芦荟胶'];

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [inputValue, setInputValue] = useState(state.searchQuery || '');

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputValue.trim();
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
    if (query) {
      navigate('/search');
    } else {
      navigate('/');
    }
  };

  const handleHotWordClick = (word: string) => {
    setInputValue(word);
    dispatch({ type: 'SET_SEARCH_QUERY', payload: word });
    navigate('/search');
  };

  return (
    <header className={styles.header}>
      {/* 顶部灰色导航条 */}
      <div className={styles.topNav}>
        <div className={`container ${styles.topNavContainer}`}>
          <div className={styles.navLeft}>
            <Link to="/" className={styles.navItem}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 4}}>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              京东首页
            </Link>
            <span className={styles.location}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 4}}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              新疆
            </span>
          </div>
          <div className={styles.navRight}>
            <div className={styles.navItem}>
              你好，<span className={styles.redText}>请登录</span> <span className={styles.navLink}>免费注册</span>
            </div>
            <span className={styles.divider}>|</span>
            <div className={styles.navItem}>我的订单</div>
            <span className={styles.divider}>|</span>
            <div className={styles.navItem}>我的京东<span className={styles.arrowDown}></span></div>
            <span className={styles.divider}>|</span>
            <div className={styles.navItem}>企业采购<span className={styles.arrowDown}></span></div>
            <span className={styles.divider}>|</span>
            <div className={styles.navItem}>客户服务<span className={styles.arrowDown}></span></div>
            <span className={styles.divider}>|</span>
            <div className={styles.navItem}>网站导航<span className={styles.arrowDown}></span></div>
            <span className={styles.divider}>|</span>
            <div className={styles.navItem}>手机京东</div>
            <span className={styles.divider}>|</span>
            <div className={styles.navItem}>网站无障碍</div>
          </div>
        </div>
      </div>

      {/* 主头部搜索区域 */}
      <div className={styles.mainHeader}>
        <div className={`container ${styles.mainHeaderContainer}`}>
          <div className={styles.logoArea}>
            <Link to="/" className={styles.logoLink}>
              <div className={styles.logoGraphic}>
                <svg viewBox="0 0 100 100" width="40" height="40">
                  {/* 简单的狗狗剪影占位 */}
                  <path d="M70 40 Q80 40 85 50 Q90 60 80 65 Q70 65 65 60 Q60 55 55 60 Q50 65 40 65 Q30 65 25 55 Q20 45 25 35 Q30 25 40 25 Q50 25 55 30 Q60 35 65 40" fill="#ccc" />
                </svg>
              </div>
              <div className={styles.logoTextWrapper}>
                <span className={styles.logoBrand}>京东</span>
                <span className={styles.logoHighlight}>热卖</span>
                <span className={styles.logoDomain}>re.jd.com</span>
              </div>
            </Link>
          </div>

          <div className={styles.searchArea}>
            <form className={styles.searchBox} onSubmit={handleSearch}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="金龙鱼调和油"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button type="submit" className={styles.searchBtn}>搜索</button>
            </form>
            <div className={styles.hotWords}>
              {hotWords.map((word) => (
                <button 
                  key={word} 
                  type="button" 
                  className={styles.hotWord}
                  onClick={() => handleHotWordClick(word)}
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
