import React from 'react';
import { Link } from 'react-router-dom';
import CartIcon from './CartIcon';
import Navigation from './Navigation';
import SearchBar from './SearchBar';
import styles from './Header.module.css';

const topLinks = ['我的订单', '会员频道', '企业采购', '客户服务'];
const hotKeywords = ['国家补贴', '手机换新', '游戏本爆款', '家电以旧换新', '防晒热卖'];

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={styles.noticeBar}>
        <div className={`container ${styles.noticeInner}`}>
          <span className={styles.noticeText}>多快好省，逛热卖就来京选商城</span>
          <div className={styles.noticeLinks}>
            {topLinks.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        <div className={styles.topBar}>
          <div className={styles.logoArea}>
            <Link to="/" className={styles.logoLink}>
              <span className={styles.logoBadge}>京</span>
              <span className={styles.logoMeta}>
                <span className={styles.logoText}>京选商城</span>
                <span className={styles.logoSub}>热门爆款每日上新</span>
              </span>
            </Link>
          </div>

          <div className={styles.searchArea}>
            <SearchBar />
            <div className={styles.hotKeywords}>
              {hotKeywords.map((keyword) => (
                <span key={keyword} className={styles.keyword}>
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.userArea}>
            <div className={styles.serviceCard}>
              <span className={styles.serviceTag}>自营热卖</span>
              <span className={styles.serviceTag}>现货速发</span>
              <span className={styles.serviceTag}>7 天无忧</span>
            </div>
            <CartIcon />
          </div>
        </div>

        <Navigation />
      </div>
    </header>
  );
};

export default Header;
