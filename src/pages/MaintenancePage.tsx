import React from 'react';
import styles from './MaintenancePage.module.css';

const MaintenancePage: React.FC = () => {
  return (
    <div className={styles.maintenanceContainer}>
      <div className={styles.content}>
        <div className={styles.icon}>🚧</div>
        <h1 className={styles.title}>网站维护中</h1>
        <p className={styles.message}>
          我们正在对系统进行升级维护，暂时无法访问。<br />
          给您带来的不便敬请谅解，请稍后再试。
        </p>
      </div>
    </div>
  );
};

export default MaintenancePage;
