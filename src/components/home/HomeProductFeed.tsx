import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { fetchProductFeed } from '../../services/productFeedService';
import type { Product } from '../../types';
import ProductCard from '../product/ProductCard';
import styles from './HomeProductFeed.module.css';

const PAGE_SIZE = 12;
const MAX_ROWS = 120;
const ROTATE_MS = 75000;

type TabDef = { key: string; label: string };

const dedupeById = (products: Product[]): Product[] => {
  const seen = new Set<string>();

  return products.filter((product) => {
    if (seen.has(product.id)) {
      return false;
    }

    seen.add(product.id);
    return true;
  });
};

export interface HomeProductFeedProps {
  categoryTabs: string[];
}

const HomeProductFeed: React.FC<HomeProductFeedProps> = ({ categoryTabs }) => {
  const { dispatch } = useApp();
  const [tab, setTab] = useState('');
  const [rows, setRows] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedIdsRef = useRef<Set<string>>(new Set());
  const seedRef = useRef(1);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const tabs: TabDef[] = [
    { key: '', label: '为你推荐' },
    ...categoryTabs.map((label) => ({ key: label, label })),
  ];

  const mergeIntoContext = useCallback(
    (products: Product[]) => {
      if (products.length > 0) {
        dispatch({ type: 'MERGE_PRODUCTS', payload: products });
      }
    },
    [dispatch],
  );

  const fetchBatch = useCallback(
    async (append: boolean) => {
      if (loadingRef.current) {
        return;
      }

      loadingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        if (!append) {
          loadedIdsRef.current = new Set();
        }

        const exclude = [...loadedIdsRef.current];
        const seed = seedRef.current++;

        const batch = await fetchProductFeed({
          excludeIds: exclude,
          limit: PAGE_SIZE,
          category: tab || undefined,
          seed,
        });

        mergeIntoContext(batch);
        batch.forEach((product) => loadedIdsRef.current.add(product.id));

        setRows((previous) => {
          const combined = append ? [...previous, ...batch] : batch;
          return dedupeById(combined).slice(0, MAX_ROWS);
        });
      } catch {
        setError('推荐流暂时不可用，请稍后重试');
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [mergeIntoContext, tab],
  );

  useEffect(() => {
    void fetchBatch(false);
  }, [tab, fetchBatch]);

  useEffect(() => {
    const node = sentinelRef.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((entry) => entry.isIntersecting);

        if (hit && rows.length > 0 && rows.length < MAX_ROWS && !loadingRef.current) {
          void fetchBatch(true);
        }
      },
      { rootMargin: '280px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rows.length, fetchBatch]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === 'hidden' || loadingRef.current) {
        return;
      }

      void (async () => {
        try {
          const novel = await fetchProductFeed({
            excludeIds: [...loadedIdsRef.current],
            limit: 8,
            category: tab || undefined,
            seed: Date.now(),
          });

          if (novel.length === 0) {
            return;
          }

          mergeIntoContext(novel);

          const fresh = novel.filter((product) => !loadedIdsRef.current.has(product.id));
          fresh.forEach((product) => loadedIdsRef.current.add(product.id));

          if (fresh.length > 0) {
            setRows((previous) => dedupeById([...fresh, ...previous]).slice(0, MAX_ROWS));
          }
        } catch {
          /* ignore */
        }
      })();
    }, ROTATE_MS);

    return () => window.clearInterval(id);
  }, [mergeIntoContext, tab]);

  const handleTab = (next: string) => {
    if (next === tab) {
      return;
    }

    setTab(next);
    setRows([]);
    setError(null);
    seedRef.current += 1;
  };

  const handleShuffle = () => {
    seedRef.current += 199;
    setRows([]);
    setError(null);
    void fetchBatch(false);
  };

  return (
    <section className={styles.feedSection} aria-label="为你推荐商品流">
      <div className={styles.feedHeader}>
        <div className={styles.tabRow}>
          {tabs.map((item) => (
            <button
              key={item.key || 'recommend'}
              type="button"
              className={`${styles.tab} ${tab === item.key ? styles.tabActive : ''}`}
              onClick={() => handleTab(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className={styles.feedActions}>
          <span className={styles.feedHint}>接口按「排除已展示」换批次，减少重复</span>
          <button type="button" className={styles.shuffleBtn} onClick={handleShuffle} disabled={loading}>
            换一批
          </button>
        </div>
      </div>

      {error ? <p className={styles.feedError}>{error}</p> : null}

      <div className={styles.feedGrid}>
        {rows.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />

      {loading ? <p className={styles.feedLoading}>正在拉取热卖榜商品…</p> : null}

      {!loading && rows.length === 0 ? <p className={styles.feedEmpty}>暂无可用商品，请稍后重试。</p> : null}
    </section>
  );
};

export default HomeProductFeed;
