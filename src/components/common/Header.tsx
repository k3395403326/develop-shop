import React from 'react';
import { Link } from 'react-router-dom';
import CartIcon from './CartIcon';
import Navigation from './Navigation';
import SearchBar from './SearchBar';
import styles from './Header.module.css';

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={styles.noticeBar}>
        <div className={`container ${styles.noticeInner}`}>
          <span className={styles.noticeText}>欢迎来到精选商城</span>
          <div className={styles.noticeLinks}>
            <span>品质保障</span>
            <span>极速发货</span>
            <span>省心售后</span>
          </div>
        </div>
      </div>

      <div className="container">
        <div className={styles.topBar}>
          <div className={styles.logo}>
            <Link to="/" className={styles.logoLink}>
              <span className={styles.logoBadge}>JX</span>
              <span className={styles.logoMeta}>
                <span className={styles.logoText}>精选商城</span>
                <span className={styles.logoSub}>品质会场</span>
              </span>
            </Link>
          </div>

          <div className={styles.searchSection}>
            <SearchBar />
          </div>

          <div className={styles.userSection}>
            <CartIcon />
          </div>
        </div>

        <Navigation />
      </div>
    </header>
  );
};

export default Header;
