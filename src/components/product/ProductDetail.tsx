import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Product } from '../../types';
import AttributeSelector from './AttributeSelector';
import ProductImages from './ProductImages';
import styles from './ProductDetail.module.css';

interface ProductDetailProps {
  product: Product;
}

const formatPrice = (price: number) => `¥${price.toLocaleString('zh-CN')}`;

const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const { addToCart } = useCart();

  const requiredAttributes = useMemo(
    () => product.attributes.filter((attribute) => attribute.options.length > 0),
    [product.attributes],
  );
  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const saveAmount = product.originalPrice ? product.originalPrice - product.price : 0;
  const canPurchase =
    product.stock > 0 &&
    quantity > 0 &&
    requiredAttributes.every((attribute) => Boolean(selectedAttributes[attribute.name]));

  const handleQuantityChange = (nextQuantity: number) => {
    if (product.stock === 0) {
      setQuantity(0);
      return;
    }

    const normalizedQuantity = Math.min(product.stock, Math.max(1, nextQuantity));
    setQuantity(normalizedQuantity);
  };

  const handleAttributeChange = (attributeName: string, value: string) => {
    setSelectedAttributes((previous) => ({
      ...previous,
      [attributeName]: value,
    }));
  };

  const handleAddToCart = () => {
    if (!canPurchase) {
      setFeedbackMessage(product.stock > 0 ? '请选择完整规格后再加入购物车。' : '当前商品暂时缺货。');
      return;
    }

    addToCart(product.id, selectedAttributes, quantity);
    setFeedbackMessage('已加入购物车，商品会在购物车中保留。');
  };

  const handleBuyNow = () => {
    if (!canPurchase) {
      return;
    }

    addToCart(product.id, selectedAttributes, quantity);
    navigate('/cart');
  };

  const starText = `${'★'.repeat(Math.round(product.rating))}${'☆'.repeat(Math.max(0, 5 - Math.round(product.rating)))}`;

  useEffect(() => {
    if (!feedbackMessage) {
      return undefined;
    }

    const timer = window.setTimeout(() => setFeedbackMessage(''), 2400);
    return () => window.clearTimeout(timer);
  }, [feedbackMessage]);

  return (
    <article className={styles.productDetail}>
      <nav className={styles.breadcrumb}>
        <Link to="/" className={styles.breadcrumbLink}>
          首页
        </Link>
        <span className={styles.breadcrumbSeparator}>&gt;</span>
        <span>{product.category}</span>
        <span className={styles.breadcrumbSeparator}>&gt;</span>
        <span>{product.name}</span>
      </nav>

      <section className={styles.mainContent}>
        <div className={styles.imageSection}>
          <ProductImages images={product.images} productName={product.name} selectedAttributes={selectedAttributes} />
        </div>

        <div className={styles.infoSection}>
          <div className={styles.tagRow}>
            <span className={styles.tag}>京选自营</span>
            <span className={`${styles.tag} ${styles.tagLight}`}>热卖榜单</span>
            <span className={`${styles.tag} ${styles.tagLight}`}>现货速发</span>
          </div>

          <h1 className={styles.productTitle}>{product.name}</h1>
          <p className={styles.productSubtitle}>{product.description}</p>

          <div className={styles.priceSection}>
            <div className={styles.priceLabel}>到手价</div>
            <div className={styles.priceRow}>
              <span className={styles.currentPrice}>{formatPrice(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price ? (
                <>
                  <span className={styles.originalPrice}>{formatPrice(product.originalPrice)}</span>
                  <span className={styles.discount}>已省 {formatPrice(saveAmount)} / {discountPercentage}% OFF</span>
                </>
              ) : null}
            </div>
          </div>

          <div className={styles.promiseRow}>
            <span className={styles.promiseItem}>国家补贴会场同款</span>
            <span className={styles.promiseItem}>支持加入购物车继续选购</span>
            <span className={styles.promiseItem}>图片已优化为完整展示</span>
          </div>

          <div className={styles.metaInfo}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>评分</span>
              <div className={styles.rating}>
                <span className={styles.stars}>{starText}</span>
                <span className={styles.ratingText}>
                  {product.rating.toFixed(1)} 分 · {product.reviewCount.toLocaleString('zh-CN')} 条评价
                </span>
              </div>
            </div>

            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>库存</span>
              <span
                className={`${styles.metaValue} ${product.stock < 10 ? styles.stockWarning : ''} ${product.stock === 0 ? styles.outOfStock : ''}`}
              >
                {product.stock > 0 ? `${product.stock} 件可售` : '暂时缺货'}
              </span>
            </div>

            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>分类</span>
              <span className={styles.metaValue}>{product.category}</span>
            </div>

            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>商品编号</span>
              <span className={styles.metaValue}>{product.id}</span>
            </div>
          </div>

          {product.attributes.length > 0 ? (
            <div className={styles.attributesSection}>
              <h3 className={styles.sectionTitle}>选择规格</h3>
              <AttributeSelector
                attributes={product.attributes}
                selectedAttributes={selectedAttributes}
                onAttributeChange={handleAttributeChange}
              />
            </div>
          ) : null}

          <div className={styles.purchaseBar}>
            <div className={styles.quantitySelector}>
              <span className={styles.quantityLabel}>数量</span>
              <div className={styles.quantityControls}>
                <button
                  className={styles.quantityButton}
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1 || product.stock === 0}
                  type="button"
                >
                  -
                </button>
                <input
                  type="number"
                  className={styles.quantityInput}
                  value={product.stock === 0 ? 0 : quantity}
                  onChange={(event) => handleQuantityChange(Number(event.target.value) || 1)}
                  min="1"
                  max={product.stock}
                />
                <button
                  className={styles.quantityButton}
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= product.stock || product.stock === 0}
                  type="button"
                >
                  +
                </button>
              </div>
            </div>

            <div className={styles.actionsSection}>
              <button className={styles.addToCartButton} onClick={handleAddToCart} disabled={!canPurchase} type="button">
                {product.stock === 0 ? '暂时缺货' : '加入购物车'}
              </button>
              <button className={styles.buyNowButton} onClick={handleBuyNow} disabled={!canPurchase} type="button">
                {product.stock === 0 ? '暂时缺货' : '立即购买'}
              </button>
            </div>
          </div>

          {product.stock > 0 && product.stock < 10 ? (
            <div className={styles.stockWarning}>库存紧张，仅剩 {product.stock} 件。</div>
          ) : null}

          {feedbackMessage ? (
            <div className={styles.feedback} role="status">
              {feedbackMessage}
            </div>
          ) : null}
        </div>
      </section>

      <section className={styles.description}>
        <h2 className={styles.descriptionTitle}>商品详情</h2>
        <div className={styles.descriptionContent}>
          <p>{product.description}</p>
          <p>{product.name} 适合日常使用、送礼或换新场景，当前页面已经统一成更偏京东风格的商品详情布局。</p>
          <p>支持选择规格、调整数量、加入购物车和直接下单，桌面端和移动端都可以正常浏览。</p>
        </div>
      </section>
    </article>
  );
};

export default ProductDetail;
