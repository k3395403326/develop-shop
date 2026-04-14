import React from 'react';
import { useFilteredProducts } from '../../context/AppContext';
import { Product } from '../../types';
import { isRenderableProduct } from '../../utils/dataGenerator';
import ProductCard from './ProductCard';
import styles from './ProductList.module.css';

interface ProductListProps {
  products?: Product[];
}

const ProductList: React.FC<ProductListProps> = ({ products: externalProducts }) => {
  const contextProducts = useFilteredProducts();
  const sourceProducts = externalProducts ?? contextProducts;
  const products = sourceProducts.filter(isRenderableProduct);
  const hiddenCount = sourceProducts.length - products.length;

  if (products.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 16.1 19 15 19H9C7.9 19 7 18.1 7 17V13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className={styles.emptyTitle}>没有找到匹配的商品</h3>
        <p className={styles.emptyDescription}>可以换个关键词试试，或者切换分类继续浏览热门会场。</p>
      </div>
    );
  }

  return (
    <div className={styles.productList}>
      {hiddenCount > 0 ? (
        <div className={styles.notice}>已自动隐藏 {hiddenCount} 个信息不完整的商品，保证页面展示更稳定。</div>
      ) : null}

      <div className={styles.productGrid}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
