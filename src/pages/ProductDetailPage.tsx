import React from 'react';
import { Link, useParams } from 'react-router-dom';
import ProductDetail from '../components/product/ProductDetail';
import { useApp } from '../context/AppContext';
import styles from './ProductDetailPage.module.css';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state } = useApp();
  const product = state.products.find((item) => item.id === id);

  if (state.isLoading) {
    return (
      <div className={styles.productDetailPage}>
        <div className="container">
          <div className={styles.loadingWrapper}>
            <div className="loading"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.notFound}>
        <div className={styles.notFoundContent}>
          <h2>商品不存在</h2>
          <p>这个商品可能已经下架，或者当前链接地址不正确。</p>
          <Link to="/" className="btn btn-primary">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.productDetailPage}>
      <div className="container">
        <div className={styles.breadcrumb}>
          <Link to="/" className={styles.backBtn}>
            返回商品列表
          </Link>
          <span className={styles.breadcrumbPath}>
            {product.category} / {product.name}
          </span>
        </div>

        <ProductDetail product={product} />
      </div>
    </div>
  );
};

export default ProductDetailPage;
