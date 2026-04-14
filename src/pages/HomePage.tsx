import React from 'react';
import ProductList from '../components/product/ProductList';
import { useApp, useFilteredProducts } from '../context/AppContext';
import styles from './HomePage.module.css';

const HomePage: React.FC = () => {
  const { state } = useApp();
  const filteredProducts = useFilteredProducts();
  const discountCount = filteredProducts.filter(
    (product) => product.originalPrice && product.originalPrice > product.price,
  ).length;
  const inStockCount = filteredProducts.filter((product) => product.stock > 0).length;

  if (state.isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className="loading"></div>
        <p>正在整理商品数据...</p>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3>页面加载失败</h3>
        <p>{state.error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          重新加载
        </button>
      </div>
    );
  }

  return (
    <div className={styles.homePage}>
      <div className="container">
        <section className={styles.heroPanel}>
          <div className={styles.heroText}>
            <span className={styles.eyebrow}>{state.selectedCategory || '今日精选'}</span>
            <h1 className={styles.heroTitle}>商品页已经恢复，同时补上了稳定的图片兜底。</h1>
            <p className={styles.heroDescription}>
              现在即使外链图片失效，商品卡片也会正常显示，不会再出现整块空白商品区域。
            </p>
          </div>

          <div className={styles.statGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>可展示商品</span>
              <strong className={styles.statValue}>{filteredProducts.length}</strong>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>现货商品</span>
              <strong className={styles.statValue}>{inStockCount}</strong>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>优惠商品</span>
              <strong className={styles.statValue}>{discountCount}</strong>
            </div>
          </div>
        </section>

        <section className={styles.pageHeader}>
          <div>
            <h2 className={styles.pageTitle}>
              {state.selectedCategory ? `${state.selectedCategory} 商品` : '全部商品'}
            </h2>
            <p className={styles.productCount}>共找到 {filteredProducts.length} 件可正常展示的商品</p>
          </div>

          <div className={styles.metaChips}>
            {state.searchQuery ? <span className={styles.chip}>搜索: {state.searchQuery}</span> : null}
            <span className={styles.chip}>
              排序: {state.sortBy === 'price' ? '价格' : state.sortBy === 'reviewCount' ? '销量' : '评分'}
            </span>
          </div>
        </section>

        <ProductList products={filteredProducts} />
      </div>
    </div>
  );
};

export default HomePage;
