import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import styles from './CartIcon.module.css';

const CartIcon: React.FC = () => {
  const { cart } = useCart();

  return (
    <Link to="/cart" className={styles.cartLink}>
      <div className={styles.cartIcon}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 16.1 19 15 19H9C7.9 19 7 18.1 7 17V13M9 21C9.6 21 10 21.4 10 22S9.6 23 9 23 8 22.6 8 22 8.4 21 9 21ZM20 21C20.6 21 21 21.4 21 22S20.6 23 20 23 19 22.6 19 22 19.4 21 20 21Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {cart.totalItems > 0 ? <span className={styles.badge}>{cart.totalItems > 99 ? '99+' : cart.totalItems}</span> : null}
      </div>

      <span className={styles.cartText}>购物车</span>
    </Link>
  );
};

export default CartIcon;
