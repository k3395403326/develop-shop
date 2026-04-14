import React from 'react';
import { Link } from 'react-router-dom';
import cartStyles from '../components/cart/Cart.module.css';
import { useApp } from '../context/AppContext';
import { useCart } from '../context/CartContext';
import { getDefaultImage } from '../utils/imageUtils';

const formatPrice = (price: number) => `¥${price.toLocaleString('zh-CN')}`;

const CartPage: React.FC = () => {
  const { state } = useApp();
  const { cart, clearCart, removeFromCart, updateQuantity } = useCart();

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

  if (entries.length === 0) {
    return (
      <div className={cartStyles.cart}>
        <div className={cartStyles.emptyCart}>
          <div className={cartStyles.emptyIcon}>0</div>
          <h2 className={cartStyles.emptyTitle}>购物车还是空的</h2>
          <p className={cartStyles.emptyDescription}>先去挑几件最近热卖的商品吧，加购之后会显示在这里。</p>
          <Link to="/" className={cartStyles.shopNowButton}>
            去逛热卖
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={cartStyles.cart}>
      <div className={cartStyles.header}>
        <div>
          <h1 className={cartStyles.title}>购物车</h1>
          <p className={cartStyles.itemCount}>
            共 {entries.length} 种商品，{cart.totalItems} 件
          </p>
        </div>
      </div>

      <div className={cartStyles.cartContent}>
        <div className={cartStyles.itemsList}>
          {entries.map(({ item, product }) => (
            <div
              key={`${item.productId}-${JSON.stringify(item.selectedAttributes)}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '96px 1fr auto',
                gap: '16px',
                padding: '20px',
                borderBottom: '1px solid #eef2f7',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: '96px',
                  height: '96px',
                  padding: '10px',
                  borderRadius: '16px',
                  background: 'linear-gradient(180deg, #fff8f7 0%, #fff 100%)',
                  border: '1px solid rgba(31,35,41,0.06)',
                }}
              >
                <img
                  src={product.images[0] ?? getDefaultImage(300, 300, product.name)}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              </div>

              <div style={{ minWidth: 0 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: '#111827' }}>{product.name}</h3>
                <p style={{ margin: '0 0 8px', color: '#6b7280', fontSize: '13px' }}>{product.category}</p>
                {Object.keys(item.selectedAttributes).length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                    {Object.entries(item.selectedAttributes)
                      .filter(([, value]) => value)
                      .map(([name, value]) => (
                        <span
                          key={`${name}-${value}`}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '999px',
                            background: '#f8fafc',
                            color: '#475569',
                            fontSize: '12px',
                          }}
                        >
                          {name}: {value}
                        </span>
                      ))}
                  </div>
                ) : null}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => updateQuantity(item.productId, item.selectedAttributes, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span style={{ minWidth: '28px', textAlign: 'center' }}>{item.quantity}</span>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => updateQuantity(item.productId, item.selectedAttributes, item.quantity + 1)}
                    disabled={item.quantity >= product.stock}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => removeFromCart(item.productId, item.selectedAttributes)}
                  >
                    删除
                  </button>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#e1251b', fontSize: '20px', fontWeight: 700 }}>
                  {formatPrice(product.price * item.quantity)}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '6px' }}>
                  单价 {formatPrice(product.price)}
                </div>
              </div>
            </div>
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
            onClick={() => window.alert('当前项目为演示站点，购物车内容已成功保留。')}
          >
            去结算
          </button>
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
    </div>
  );
};

export default CartPage;
