import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import ProgressiveImage from '../components/common/ProgressiveImage';
import ProductList from '../components/product/ProductList';
import { useApp, useFilteredProducts } from '../context/AppContext';
import { getDefaultImage } from '../utils/imageUtils';
import styles from './HomePage.module.css';

const keywordTags = ['国家补贴', '爆款直降', '热榜更新', '现货优先'];

const serviceHighlights = [
  {
    title: '快',
    subtitle: '热卖商品更集中',
    description: '首页优先收拢高热度和现货商品，逛起来更接近主站会场。',
  },
  {
    title: '省',
    subtitle: '好价信息更清楚',
    description: '折扣幅度、到手价和热度标签放在一屏内，不用反复点进详情。',
  },
  {
    title: '稳',
    subtitle: '图片风格更统一',
    description: '商品图改成统一的精品视觉，不再出现杂乱抓取图和二手感封面。',
  },
  {
    title: '新',
    subtitle: '榜单商品会更新',
    description: '商品仍然来自京东热卖榜，抓取失败时自动切回兜底爆款库。',
  },
];

const skeletonItems = Array.from({ length: 8 }, (_, index) => index);

const formatPrice = (price: number) => `¥${price.toLocaleString('zh-CN')}`;

const formatUpdatedAt = (timestamp: number | null): string =>
  timestamp
    ? new Intl.DateTimeFormat('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(timestamp)
    : '等待更新';

const clampText = (value: string, maxLength: number): string =>
  value.length > maxLength ? `${value.slice(0, maxLength).trim()}...` : value;

const HomePage: React.FC = () => {
  const { state, dispatch } = useApp();
  const filteredProducts = useFilteredProducts();
  const inStockCount = filteredProducts.filter((product) => product.stock > 0).length;
  const discountProducts = filteredProducts.filter(
    (product) => product.originalPrice && product.originalPrice > product.price,
  );
  const totalSavings = discountProducts.reduce(
    (sum, product) => sum + ((product.originalPrice ?? product.price) - product.price),
    0,
  );

  const topDeals = useMemo(
    () =>
      [...filteredProducts]
        .sort(
          (a, b) =>
            (b.originalPrice ?? b.price) -
            b.price -
            ((a.originalPrice ?? a.price) - a.price),
        )
        .slice(0, 4),
    [filteredProducts],
  );

  const hotRankings = useMemo(
    () => [...filteredProducts].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 4),
    [filteredProducts],
  );

  const categoryShowcase = useMemo(
    () =>
      state.categories.map((category) => {
        const items = state.products.filter((product) => product.category === category);

        return {
          category,
          count: items.length,
          sample: items[0],
        };
      }),
    [state.categories, state.products],
  );

  const sortLabel =
    state.sortBy === 'price'
      ? `价格${state.sortOrder === 'asc' ? '从低到高' : '从高到低'}`
      : state.sortBy === 'reviewCount'
        ? '热度优先'
        : '综合推荐';

  const leadProduct = hotRankings[0] ?? topDeals[0] ?? filteredProducts[0];
  const rankingPreview = hotRankings.slice(0, 3);
  const currentLabel = state.selectedCategory || '首页热卖';
  const refreshText = state.isRefreshing
    ? '正在更新热卖榜'
    : state.lastUpdatedAt
      ? `刚刚更新 ${formatUpdatedAt(state.lastUpdatedAt)}`
      : '热卖榜准备中';

  if (state.isLoading) {
    return (
      <div className={styles.homePage}>
        <div className="container">
          <section className={styles.loadingContainer} aria-busy="true" aria-label="正在加载商品">
            <div className={`${styles.loadingHero} skeleton`}></div>
            <div className={styles.loadingGrid}>
              {skeletonItems.map((item) => (
                <div key={item} className={`${styles.loadingCard} skeleton`}></div>
              ))}
            </div>
            <p>正在整理近期热卖商品，请稍候...</p>
          </section>
        </div>
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
        <button className="btn btn-primary" onClick={() => window.location.reload()} type="button">
          重新加载
        </button>
      </div>
    );
  }

  return (
    <div className={styles.homePage}>
      <div className="container">
        <section className={styles.heroSection}>
          <aside className={styles.categoryMenu}>
            <div className={styles.menuTitle}>全部商品分类</div>
            <div className={styles.menuList}>
              <button
                className={`${styles.menuItem} ${!state.selectedCategory ? styles.menuItemActive : ''}`}
                onClick={() => dispatch({ type: 'SET_SELECTED_CATEGORY', payload: '' })}
                type="button"
              >
                <span>首页热卖</span>
                <strong>{state.products.length} 款爆品</strong>
              </button>

              {categoryShowcase.map((item) => (
                <button
                  key={item.category}
                  className={`${styles.menuItem} ${state.selectedCategory === item.category ? styles.menuItemActive : ''}`}
                  onClick={() =>
                    dispatch({
                      type: 'SET_SELECTED_CATEGORY',
                      payload: state.selectedCategory === item.category ? '' : item.category,
                    })
                  }
                  type="button"
                >
                  <span>{item.category}</span>
                  <strong>{item.count} 款热卖</strong>
                </button>
              ))}
            </div>
          </aside>

          <div className={styles.heroCenter}>
            <div className={styles.refreshBar} aria-live="polite">
              <span className={`${styles.refreshDot} ${state.isRefreshing ? styles.refreshDotActive : ''}`}></span>
              <span>{refreshText}</span>
              {state.refreshError ? <strong>{state.refreshError}</strong> : null}
            </div>

            <div className={styles.heroBanner}>
              <div className={styles.heroCopy}>
                <span className={styles.heroBadge}>主会场焕新</span>
                <h1 className={styles.heroTitle}>
                  {state.selectedCategory ? `${state.selectedCategory} 爆款会场` : '更清爽的京选热卖首页'}
                </h1>
                <p className={styles.heroDescription}>
                  首页现在优先展示京东热卖榜的高热度商品，图片统一做成精品视觉，主会场、热榜和商品卡的留白也更舒服了。
                </p>

                <div className={styles.heroActions}>
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      dispatch({
                        type: 'SET_SELECTED_CATEGORY',
                        payload: state.selectedCategory || state.categories[0] || '',
                      })
                    }
                    type="button"
                  >
                    进入热卖榜
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      dispatch({ type: 'SET_SELECTED_CATEGORY', payload: '' });
                      dispatch({ type: 'SET_SEARCH_QUERY', payload: '' });
                    }}
                    type="button"
                  >
                    查看全部商品
                  </button>
                </div>

                <div className={styles.keywordRow}>
                  {keywordTags.map((tag) => (
                    <span key={tag} className={styles.keywordChip}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {leadProduct ? (
                <Link to={`/product/${leadProduct.id}`} className={styles.spotlightCard}>
                  <div className={styles.spotlightHeader}>
                    <span className={styles.spotlightTag}>今日主推</span>
                    <span className={styles.spotlightCategory}>{leadProduct.category}</span>
                  </div>

                  <div className={styles.spotlightImageShell}>
                    <div className={styles.spotlightImageGlow}></div>
                    <ProgressiveImage
                      src={leadProduct.images[0]}
                      fallbackSrc={getDefaultImage(720, 720, leadProduct.name)}
                      alt={leadProduct.name}
                      imageClassName={styles.spotlightImage}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <div className={styles.spotlightBody}>
                    <h2 className={styles.spotlightTitle}>{leadProduct.name}</h2>
                    <p className={styles.spotlightDescription}>
                      {clampText(leadProduct.description, 54)}
                    </p>
                    <div className={styles.spotlightQuickStats}>
                      <span className={styles.spotlightStat}>
                        {leadProduct.reviewCount.toLocaleString('zh-CN')} 条评价
                      </span>
                      <span className={styles.spotlightStat}>{leadProduct.rating.toFixed(1)} 高分</span>
                    </div>
                    <div className={styles.spotlightPrice}>{formatPrice(leadProduct.price)}</div>
                  </div>
                </Link>
              ) : null}
            </div>

            <div className={styles.metricGrid}>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>当前会场商品</span>
                <strong className={styles.metricValue}>{filteredProducts.length}</strong>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>现货可下单</span>
                <strong className={styles.metricValue}>{inStockCount}</strong>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>累计可省</span>
                <strong className={styles.metricValue}>{formatPrice(totalSavings)}</strong>
              </div>
            </div>
          </div>

          <aside className={styles.heroAside}>
            <div className={styles.memberCard}>
              <span className={styles.memberTag}>精选导购</span>
              <h3 className={styles.memberTitle}>一屏看清好价和热度</h3>
              <p className={styles.memberDescription}>
                中间主会场只保留最重要的信息，热榜放到右侧卡片，浏览节奏更轻松。
              </p>
              <div className={styles.memberList}>
                <span>热卖与折扣同时展示</span>
                <span>统一商品视觉更高级</span>
                <span>图片完整展示不裁切</span>
              </div>
            </div>

            <div className={styles.rankCard}>
              <div className={styles.sectionHeading}>
                <div>
                  <h3 className={styles.sectionTitle}>热度排行</h3>
                  <p className={styles.sectionSub}>最近最受关注的商品</p>
                </div>
              </div>
              <div className={styles.rankList}>
                {rankingPreview.map((product, index) => (
                  <Link key={product.id} to={`/product/${product.id}`} className={styles.rankItem}>
                    <span className={styles.rankIndex}>{index + 1}</span>
                    <div className={styles.rankThumbWrap}>
                      <ProgressiveImage
                        src={product.images[0]}
                        fallbackSrc={getDefaultImage(180, 180, product.name)}
                        alt={product.name}
                        imageClassName={styles.rankThumb}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className={styles.rankContent}>
                      <strong>{clampText(product.name, 20)}</strong>
                      <span>{product.reviewCount.toLocaleString('zh-CN')} 条评价</span>
                    </div>
                    <span className={styles.rankPrice}>{formatPrice(product.price)}</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className={styles.promiseBar}>
          {serviceHighlights.map((item) => (
            <article key={item.title} className={styles.promiseCard}>
              <span className={styles.promiseSymbol}>{item.title}</span>
              <div>
                <h3 className={styles.promiseTitle}>{item.subtitle}</h3>
                <p className={styles.promiseDescription}>{item.description}</p>
              </div>
            </article>
          ))}
        </section>

        <section className={styles.flashSection}>
          <div className={styles.sectionHeading}>
            <div>
              <h2 className={styles.sectionTitle}>限时好价</h2>
              <p className={styles.sectionSub}>优先展示优惠幅度更明显的爆款商品</p>
            </div>
            <span className={styles.sectionMeta}>{discountProducts.length} 款直降商品</span>
          </div>

          <div className={styles.flashGrid}>
            {topDeals.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`} className={styles.flashCard}>
                <div className={styles.flashImageShell}>
                  <ProgressiveImage
                    src={product.images[0]}
                    fallbackSrc={getDefaultImage(360, 360, product.name)}
                    alt={product.name}
                    imageClassName={styles.flashImage}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className={styles.flashContent}>
                  <span className={styles.flashTag}>限时直降</span>
                  <h3 className={styles.flashTitle}>{product.name}</h3>
                  <p className={styles.flashDescription}>{product.description}</p>
                </div>
                <div className={styles.flashBottom}>
                  <div>
                    <span className={styles.flashPrice}>{formatPrice(product.price)}</span>
                    {product.originalPrice ? (
                      <span className={styles.flashOriginalPrice}>{formatPrice(product.originalPrice)}</span>
                    ) : null}
                  </div>
                  <span className={styles.flashAction}>立即查看</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.channelSection}>
          <div className={styles.sectionHeading}>
            <div>
              <h2 className={styles.sectionTitle}>频道会场</h2>
              <p className={styles.sectionSub}>按热门分类快速切换浏览体验</p>
            </div>
          </div>

          <div className={styles.channelGrid}>
            {categoryShowcase.map((item) => (
              <button
                key={item.category}
                className={`${styles.channelCard} ${state.selectedCategory === item.category ? styles.channelCardActive : ''}`}
                onClick={() => dispatch({ type: 'SET_SELECTED_CATEGORY', payload: item.category })}
                type="button"
              >
                <span className={styles.channelTop}>
                  <span className={styles.channelName}>{item.category}</span>
                  {item.sample ? (
                    <span className={styles.channelImageShell}>
                      <ProgressiveImage
                        src={item.sample.images[0]}
                        fallbackSrc={getDefaultImage(160, 160, item.sample.name)}
                        alt={item.sample.name}
                        imageClassName={styles.channelImage}
                        loading="lazy"
                        decoding="async"
                      />
                    </span>
                  ) : null}
                </span>
                <strong className={styles.channelCount}>{item.count} 款热卖</strong>
                <span className={styles.channelSample}>
                  {item.sample ? clampText(item.sample.name, 22) : '点击查看本会场商品'}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className={styles.floorHeader}>
          <div>
            <h2 className={styles.floorTitle}>{currentLabel} 商品列表</h2>
            <p className={styles.floorDescription}>
              共找到 {filteredProducts.length} 款商品，当前排序为 {sortLabel}
            </p>
          </div>

          <div className={styles.metaChips}>
            {state.searchQuery ? <span className={styles.chip}>搜索词：{state.searchQuery}</span> : null}
            <span className={styles.chip}>在售现货：{inStockCount}</span>
            <span className={styles.chip}>优惠商品：{discountProducts.length}</span>
          </div>
        </section>

        <ProductList products={filteredProducts} />
      </div>
    </div>
  );
};

export default HomePage;
