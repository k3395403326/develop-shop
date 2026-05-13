import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp, useFilteredProducts } from '../context/AppContext';
import { Product } from '../types';
import styles from './HomePage.module.css';

const categories = [
  '冰洗 / 空调 / 电视 / 厨卫大电',
  '电脑 / 办公 / 文具用品',
  '手机 / 运营商 / 数码',
  '生活电器 / 厨房小电 / 个护健康',
  '食品 / 酒类 / 生鲜 / 特产',
  '美妆 / 个护清洁 / 宠物',
  '元器件 / 劳保物资 / 五金机电',
  '家装 / 建材 / 家具',
  '家居日用 / 厨具',
  '男鞋 / 运动 / 户外',
  '男装 / 女装 / 童装 / 内衣'
];

const rightPromos = [
  { title: '国家补贴', sub: '惠享正品', bgColor: '#e6fae8', color: '#0f763a', keyword: '手机' },
  { title: '精致美妆', sub: '品质之选', bgColor: '#f6efff', color: '#6d28d9', keyword: '精华' },
  { title: '超值百货', sub: '省心省钱', bgColor: '#eaf4ff', color: '#0284c7', keyword: '洗烘' },
  { title: '品质五金', sub: '超值特惠', bgColor: '#fffbe6', color: '#d97706', keyword: '记录仪' }
];

const HomePage: React.FC = () => {
  const { state } = useApp();
  const filteredProducts = useFilteredProducts();
  
  // 用于推荐商品的状态和定时刷新逻辑
  const [recommendProducts, setRecommendProducts] = useState<Product[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // 每次刷新打乱商品数组并截取前10个
    const shuffled = [...filteredProducts].sort(() => 0.5 - Math.random());
    setRecommendProducts(shuffled.slice(0, 10));
  }, [filteredProducts, refreshKey]);

  useEffect(() => {
    // 设置每15秒刷新一次商品
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const promoImages = useMemo(() => {
    // 尝试为右侧promo寻找匹配的图片
    return rightPromos.map(promo => {
      const match = state.products.find(p => p.name.includes(promo.keyword) || p.category.includes(promo.keyword));
      return match ? match.images[0] : '';
    });
  }, [state.products]);

  // 中间Hero Banner商品
  const heroProduct = state.products.find(p => p.name.includes('电脑') || p.name.includes('极光')) || state.products[0];

  if (state.isLoading) {
    return <div className={styles.loading}>加载中...</div>;
  }

  return (
    <div className={styles.homePage}>
      <div className="container">
        
        {/* 第一屏：三列布局 */}
        <section className={styles.firstScreen}>
          
          {/* 左侧菜单 */}
          <aside className={styles.leftMenu}>
            <div className={styles.menuHeader}>分类</div>
            <ul className={styles.menuList}>
              {categories.map((cat, idx) => (
                <li key={idx} className={styles.menuItem}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: 8, opacity: 0.6}}>
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                  </svg>
                  {cat}
                </li>
              ))}
            </ul>
          </aside>

          {/* 中间大图轮播区 */}
          <div className={styles.centerHero}>
             <div className={styles.heroBanner}>
                <div className={styles.heroContent}>
                   <h2 className={styles.heroTitle}>电脑全系性能巅峰<br/>工作娱乐畅享无忧</h2>
                   <p className={styles.heroSubTitle}>极速性能 超值钜惠</p>
                </div>
                {heroProduct && (
                  <div className={styles.heroImageWrapper}>
                    <img src={heroProduct.images[0]} alt="Hero Product" className={styles.heroImage} />
                  </div>
                )}
                <div className={styles.sliderDots}>
                  <span className={`${styles.dot} ${styles.activeDot}`}></span>
                  <span className={styles.dot}></span>
                  <span className={styles.dot}></span>
                  <span className={styles.dot}></span>
                  <span className={styles.dot}></span>
                </div>
                <button className={styles.heroNavLeft}>&lt;</button>
                <button className={styles.heroNavRight}>&gt;</button>
                <div className={styles.hotTag}>HOT!</div>
             </div>
          </div>

          {/* 右侧促销位 */}
          <div className={styles.rightPromos}>
            {rightPromos.map((promo, idx) => (
              <div key={idx} className={styles.promoCard} style={{ backgroundColor: promo.bgColor }}>
                <div className={styles.promoText}>
                  <div className={styles.promoTitle} style={{ color: promo.color }}>{promo.title}</div>
                  <div className={styles.promoSub} style={{ color: promo.color }}>{promo.sub}</div>
                </div>
                <div className={styles.promoImgWrapper}>
                  {promoImages[idx] && <img src={promoImages[idx]} alt={promo.title} className={styles.promoImg} />}
                </div>
              </div>
            ))}
          </div>

        </section>

        {/* 为你推荐 */}
        <section className={styles.recommendSection}>
          <div className={styles.sectionHeader}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#e1251b" style={{marginRight: 8}}>
               <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
               <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <h3 className={styles.sectionTitle}>为你推荐</h3>
            <span className={styles.refreshIndicator}>
              <span className={styles.pulseDot}></span> 将在数秒后自动更新
            </span>
          </div>

          <div className={styles.recommendGrid}>
            {recommendProducts.map((product) => {
              const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
              return (
                <Link to={`/product/${product.id}`} key={product.id} className={styles.productCard}>
                  <div className={styles.productImgWrapper}>
                    <img src={product.images[0]} alt={product.name} className={styles.productImg} />
                  </div>
                  <div className={styles.productInfo}>
                    {discount > 0 && (
                      <div className={styles.tags}>
                        <span className={styles.tagLabel}>本店铺热卖商品</span>
                        <span className={styles.tagHighlight}>立省{discount}%</span>
                      </div>
                    )}
                    <h4 className={styles.productName}>{product.name}</h4>
                    <div className={styles.priceRow}>
                      <span className={styles.priceSymbol}>¥</span>
                      <span className={styles.priceValue}>{product.price.toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
};

export default HomePage;
