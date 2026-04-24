import React from 'react';
import { useApp } from '../../context/AppContext';
import styles from './Navigation.module.css';

const Navigation: React.FC = () => {
  const { state, dispatch } = useApp();

  const handleCategoryClick = (category: string) => {
    dispatch({
      type: 'SET_SELECTED_CATEGORY',
      payload: state.selectedCategory === category ? '' : category,
    });
  };

  const handleSortChange = (sortBy: 'price' | 'rating' | 'reviewCount', sortOrder: 'asc' | 'desc') => {
    dispatch({ type: 'SET_SORT', payload: { sortBy, sortOrder } });
  };

  return (
    <nav className={styles.navigation}>
      <div className={styles.channelBadge}>精选频道</div>

      <div className={styles.categories}>
        <button
          className={`${styles.categoryItem} ${!state.selectedCategory ? styles.active : ''}`}
          onClick={() => dispatch({ type: 'SET_SELECTED_CATEGORY', payload: '' })}
          type="button"
          aria-current={!state.selectedCategory ? 'page' : undefined}
        >
          全部分类
        </button>

        {state.categories.map((category) => (
          <button
            key={category}
            className={`${styles.categoryItem} ${state.selectedCategory === category ? styles.active : ''}`}
            onClick={() => handleCategoryClick(category)}
            type="button"
            aria-current={state.selectedCategory === category ? 'page' : undefined}
          >
            {category}
          </button>
        ))}
      </div>

      <div className={styles.sortOptions}>
        <span className={styles.sortLabel}>排序</span>

        <button
          className={`${styles.sortItem} ${state.sortBy === 'rating' && state.sortOrder === 'desc' ? styles.activeSort : ''}`}
          onClick={() => handleSortChange('rating', 'desc')}
          type="button"
        >
          综合推荐
        </button>

        <button
          className={`${styles.sortItem} ${state.sortBy === 'reviewCount' && state.sortOrder === 'desc' ? styles.activeSort : ''}`}
          onClick={() => handleSortChange('reviewCount', 'desc')}
          type="button"
        >
          热度优先
        </button>

        <button
          className={`${styles.sortItem} ${state.sortBy === 'price' ? styles.activeSort : ''}`}
          onClick={() =>
            handleSortChange('price', state.sortBy === 'price' && state.sortOrder === 'asc' ? 'desc' : 'asc')
          }
          type="button"
        >
          价格
          <span className={styles.priceArrows}>
            <svg
              width="8"
              height="8"
              viewBox="0 0 24 24"
              fill="none"
              className={state.sortBy === 'price' && state.sortOrder === 'asc' ? styles.activeArrow : ''}
            >
              <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" />
            </svg>
            <svg
              width="8"
              height="8"
              viewBox="0 0 24 24"
              fill="none"
              className={state.sortBy === 'price' && state.sortOrder === 'desc' ? styles.activeArrow : ''}
            >
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" />
            </svg>
          </span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
