import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Product } from '../../types';
import AttributeSelector from './AttributeSelector';
import ProductImages from './ProductImages';
import styles from './ProductDetail.module.css';

interface ProductDetailProps {
  product: Product;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
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
      return;
    }

    addToCart(product.id, selectedAttributes, quantity);
    window.alert('已加入购物车。');
  };

  const handleBuyNow = () => {
    if (!canPurchase) {
      return;
    }

    addToCart(product.id, selectedAttributes, quantity);
    navigate('/cart');
  };

  const starText = `${'★'.repeat(Math.round(product.rating))}${'☆'.repeat(Math.max(0, 5 - Math.round(product.rating)))}`;

  return (
    <div className={styles.productDetail}>
      <nav className={styles.breadcrumb}>
        <Link to="/" className={styles.breadcrumbLink}>
          首页
        </Link>
        <span className={styles.breadcrumbSeparator}>&gt;</span>
        <span>{product.category}</span>
        <span className={styles.breadcrumbSeparator}>&gt;</span>
        <span>{product.name}</span>
      </nav>

      <div className={styles.mainContent}>
        <div className={styles.imageSection}>
          <ProductImages images={product.images} productName={product.name} selectedAttributes={selectedAttributes} />
        </div>

        <div className={styles.infoSection}>
          <h1 className={styles.productTitle}>{product.name}</h1>
          <p className={styles.productSubtitle}>{product.description}</p>

          <div className={styles.priceSection}>
            <div className={styles.priceLabel}>到手价</div>
            <div>
              <span className={styles.currentPrice}>¥{product.price.toLocaleString()}</span>
              {product.originalPrice && product.originalPrice > product.price ? (
                <>
                  <span className={styles.originalPrice}>¥{product.originalPrice.toLocaleString()}</span>
                  <span className={styles.discount}>省 ¥{saveAmount.toLocaleString()} / {discountPercentage}% OFF</span>
                </>
              ) : null}
            </div>
          </div>

          <div className={styles.metaInfo}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>评分</span>
              <div className={styles.rating}>
                <span className={styles.stars}>{starText}</span>
                <span className={styles.ratingText}>
                  {product.rating.toFixed(1)} ({product.reviewCount} 条评价)
                </span>
              </div>
            </div>

            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>库存</span>
              <span
                className={`${styles.metaValue} ${product.stock < 10 ? styles.stockWarning : ''} ${product.stock === 0 ? styles.outOfStock : ''}`}
              >
                {product.stock > 0 ? `${product.stock} 件` : '暂时缺货'}
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

          <div className={styles.actionsSection}>
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
          </div>

          <div className={styles.actionsSection}>
            <button className={styles.addToCartButton} onClick={handleAddToCart} disabled={!canPurchase} type="button">
              {product.stock === 0 ? '暂时缺货' : '加入购物车'}
            </button>
            <button className={styles.buyNowButton} onClick={handleBuyNow} disabled={!canPurchase} type="button">
              {product.stock === 0 ? '暂时缺货' : '立即购买'}
            </button>
          </div>

          {product.stock > 0 && product.stock < 10 ? (
            <div className={styles.stockWarning}>库存紧张，仅剩 {product.stock} 件。</div>
          ) : null}
        </div>
      </div>

      <div className={styles.description}>
        <h2 className={styles.descriptionTitle}>商品详情</h2>
        <div className={styles.descriptionContent}>
          <p>{product.description}</p>
          <p>{product.name} 适合日常使用和送礼场景，页面已补全图片与信息兜底，展示会更稳定。</p>
          <p>支持加入购物车继续挑选，也可以直接下单，页面在移动端和桌面端都能正常浏览。</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
