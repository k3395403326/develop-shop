import React, { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { getDefaultImage } from '../../utils/imageUtils';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const primaryImage =
    product.images.find((image) => image.trim().length > 0) ?? getDefaultImage(300, 300, product.name);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const gradientId = useId().replace(/:/g, '-');

  const formatPrice = (price: number): string => `¥${price.toLocaleString()}`;

  const renderStars = (rating: number): JSX.Element[] => {
    const stars: JSX.Element[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let index = 0; index < fullStars; index += 1) {
      stars.push(
        <svg key={`full-${index}`} width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>,
      );
    }

    if (hasHalfStar) {
      stars.push(
        <svg key="half" width="12" height="12" viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id={gradientId}>
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#e5e7eb" />
            </linearGradient>
          </defs>
          <path
            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
            fill={`url(#${gradientId})`}
          />
        </svg>,
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let index = 0; index < emptyStars; index += 1) {
      stars.push(
        <svg key={`empty-${index}`} width="12" height="12" viewBox="0 0 24 24" fill="#e5e7eb">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>,
      );
    }

    return stars;
  };

  return (
    <div className={styles.productCard}>
      <Link to={`/product/${product.id}`} className={styles.productLink}>
        <div className={styles.imageContainer}>
          {imageLoading ? (
            <div className={styles.imagePlaceholder}>
              <div className="loading"></div>
            </div>
          ) : null}

          <img
            src={imageError ? getDefaultImage(300, 300, product.name) : primaryImage}
            alt={product.name}
            className={`${styles.productImage} ${imageLoading ? styles.hidden : ''}`}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
            onLoad={() => setImageLoading(false)}
          />

          {product.originalPrice && product.originalPrice > product.price ? (
            <div className={styles.discountBadge}>
              省 ¥{(product.originalPrice - product.price).toLocaleString()}
            </div>
          ) : null}
        </div>

        <div className={styles.productInfo}>
          <h3 className={styles.productName}>{product.name}</h3>

          <div className={styles.priceSection}>
            <span className={styles.currentPrice}>{formatPrice(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price ? (
              <span className={styles.originalPrice}>{formatPrice(product.originalPrice)}</span>
            ) : null}
          </div>

          <div className={styles.ratingSection}>
            <div className={styles.stars}>{renderStars(product.rating)}</div>
            <span className={styles.rating}>{product.rating.toFixed(1)}</span>
            <span className={styles.reviewCount}>({product.reviewCount})</span>
          </div>

          <div className={styles.categoryTag}>{product.category}</div>

          <div className={styles.stockInfo}>
            {product.stock > 0 ? (
              <span className={styles.inStock}>现货速发</span>
            ) : (
              <span className={styles.outOfStock}>暂时缺货</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
