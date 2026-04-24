import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProgressiveImage from '../components/common/ProgressiveImage';
import cartStyles from '../components/cart/Cart.module.css';
import { useApp } from '../context/AppContext';
import { useCart } from '../context/CartContext';
import { getDefaultImage, getPicsumImage } from '../utils/imageUtils';

const formatPrice = (price: number) => `¥${price.toLocaleString('zh-CN')}`;

const CartPage: React.FC = () => {
  const { state } = useApp();
  const { cart, clearCart, removeFromCart, updateQuantity } = useCart();
  const [checkoutMessage, setCheckoutMessage] = useState('');

  const entries = cart.items
    .map((item) => ({
      item,
      product: state.products.find((product) => product.id === item.productId),
    }))
    .filter((entry): entry is typeof entry & { product: NonNullable<typeof entry.product> } => Boolean(entry.product));

  const totalPrice = entries.reduce((sum, entry) => sum + entry.product.price * entry.item.quantity, 0);
  const totalOriginalPrice = entries.reduce(
    (sum, entry) => sum + (entry.product.originalPrice ?? entry.product.price) * entry.item.quantity,
    0,
  );

  useEffect(() => {
    if (!checkoutMessage) {
      return undefined;
    }

    const timer = window.setTimeout(() => setCheckoutMessage(''), 2600);
    return () => window.clearTimeout(timer);
  }, [checkoutMessage]);

  if (entries.length === 0) {
    return (
      <section className={cartStyles.cart}>
        <div className={cartStyles.emptyCart}>
          <div className={cartStyles.emptyIcon}>0</div>
          <h2 className={cartStyles.emptyTitle}>购物车还是空的</h2>
          <p className={cartStyles.emptyDescription}>先去挑几件最近热卖的商品吧，加购之后会显示在这里。</p>
          <Link to="/" className={cartStyles.shopNowButton}>
            去逛热卖
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className={cartStyles.cart}>
      <header className={cartStyles.header}>
        <div>
          <h1 className={cartStyles.title}>购物车</h1>
          <p className={cartStyles.itemCount}>
            共 {entries.length} 种商品，{cart.totalItems} 件
          </p>
        </div>
      </header>

      <div className={cartStyles.cartContent}>
        <div className={cartStyles.itemsList}>
          {entries.map(({ item, product }) => (
            <article
              key={`${item.productId}-${JSON.stringify(item.selectedAttributes)}`}
              className={cartStyles.cartItem}
            >
              <div className={cartStyles.itemImageShell}>
                <ProgressiveImage
                  src={product.images[0] ?? getDefaultImage(300, 300, product.name)}
                  secondaryFallbackSrc={getPicsumImage(600, 600, `cart-${product.id}-${product.name}`)}
                  fallbackSrc={getDefaultImage(300, 300, product.name)}
                  alt={product.name}
                  imageClassName={cartStyles.itemImage}
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className={cartStyles.itemInfo}>
                <h3 className={cartStyles.itemName}>{product.name}</h3>
                <p className={cartStyles.itemCategory}>{product.category}</p>
                {Object.keys(item.selectedAttributes).length > 0 ? (
                  <div className={cartStyles.attributeList}>
                    {Object.entries(item.selectedAttributes)
                      .filter(([, value]) => value)
                      .map(([name, value]) => (
                        <span key={`${name}-${value}`} className={cartStyles.attributeChip}>
                          {name}: {value}
                        </span>
                      ))}
                  </div>
                ) : null}
                <div className={cartStyles.quantityRow}>
                  <button
                    type="button"
                    className={cartStyles.quantityButton}
                    onClick={() => updateQuantity(item.productId, item.selectedAttributes, item.quantity - 1)}
                    aria-label={`减少 ${product.name} 数量`}
                  >
                    -
                  </button>
                  <span className={cartStyles.quantityValue}>{item.quantity}</span>
                  <button
                    type="button"
                    className={cartStyles.quantityButton}
                    onClick={() => updateQuantity(item.productId, item.selectedAttributes, item.quantity + 1)}
                    disabled={item.quantity >= product.stock}
                    aria-label={`增加 ${product.name} 数量`}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className={cartStyles.removeButton}
                    onClick={() => removeFromCart(item.productId, item.selectedAttributes)}
                  >
                    删除
                  </button>
                </div>
              </div>

              <div className={cartStyles.itemPrice}>
                <strong>{formatPrice(product.price * item.quantity)}</strong>
                <span>单价 {formatPrice(product.price)}</span>
              </div>
            </article>
          ))}
        </div>

        <aside className={cartStyles.summary}>
          <h2 className={cartStyles.summaryTitle}>订单汇总</h2>
          <div className={cartStyles.summaryRow}>
            <span className={cartStyles.summaryLabel}>商品件数</span>
            <span className={cartStyles.summaryValue}>{cart.totalItems}</span>
          </div>
          <div className={cartStyles.summaryRow}>
            <span className={cartStyles.summaryLabel}>商品原价</span>
            <span className={cartStyles.summaryValue}>{formatPrice(totalOriginalPrice)}</span>
          </div>
          <div className={cartStyles.summaryRow}>
            <span className={cartStyles.summaryLabel}>已省金额</span>
            <span className={cartStyles.summaryValue}>{formatPrice(totalOriginalPrice - totalPrice)}</span>
          </div>
          <div className={cartStyles.totalRow}>
            <span className={cartStyles.totalLabel}>应付总额</span>
            <span className={cartStyles.totalValue}>{formatPrice(totalPrice)}</span>
          </div>
          <button
            type="button"
            className={cartStyles.checkoutButton}
            onClick={() => setCheckoutMessage('当前项目为演示站点，购物车内容已成功保留。')}
          >
            去结算
          </button>
          {checkoutMessage ? (
            <div className={cartStyles.checkoutNotice} role="status">
              {checkoutMessage}
            </div>
          ) : null}
          <button type="button" className={cartStyles.clearCartButton} onClick={clearCart}>
            清空购物车
          </button>
          <div className={cartStyles.actions}>
            <Link to="/" className={cartStyles.continueShoppingButton}>
              继续逛逛
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default CartPage;
