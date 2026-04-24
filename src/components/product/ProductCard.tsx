import React, { useId } from 'react';
import { Link } from 'react-router-dom';
import ProgressiveImage from '../common/ProgressiveImage';
import { Product } from '../../types';
import { getDefaultImage, getPhotoFallbackUrl } from '../../utils/imageUtils';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const fallbackImage = getDefaultImage(300, 300, product.name);
  const secondaryFallbackImage = getPhotoFallbackUrl(960, 960, product.category, product.name, `card-${product.id}`);
  const primaryImage =
    product.images.find((image) => image.trim().length > 0) ?? fallbackImage;
  const gradientId = useId().replace(/:/g, '-');
  const saveAmount = (product.originalPrice ?? product.price) - product.price;

  const formatPrice = (price: number): string => `¥${price.toLocaleString('zh-CN')}`;

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
          <div className={styles.imageStage}>
            <ProgressiveImage
              src={primaryImage}
              secondaryFallbackSrc={secondaryFallbackImage}
              fallbackSrc={fallbackImage}
              alt={product.name}
              imageClassName={styles.productImage}
              placeholderClassName={styles.imagePlaceholder}
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className={styles.badgeRow}>
            <span className={styles.categoryBadge}>{product.category}</span>
            {saveAmount > 0 ? <span className={styles.discountBadge}>省 {formatPrice(saveAmount)}</span> : null}
          </div>
        </div>

        <div className={styles.productInfo}>
          <h3 className={styles.productName}>{product.name}</h3>
          <p className={styles.productDescription}>{product.description}</p>

          <div className={styles.priceSection}>
            <span className={styles.currentPrice}>{formatPrice(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price ? (
              <span className={styles.originalPrice}>{formatPrice(product.originalPrice)}</span>
            ) : null}
          </div>

          <div className={styles.ratingSection}>
            <div className={styles.stars}>{renderStars(product.rating)}</div>
            <span className={styles.rating}>{product.rating.toFixed(1)}</span>
            <span className={styles.reviewCount}>{product.reviewCount.toLocaleString('zh-CN')} 条评价</span>
          </div>

          <div className={styles.footerRow}>
            <span className={styles.stockTag}>{product.stock > 0 ? '现货速发' : '暂时缺货'}</span>
            <span className={styles.detailLink}>查看详情</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
