import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { AppAction, AppContextType, AppState, Product } from '../types';
import { getCategories, isRenderableProduct } from '../utils/dataGenerator';
import { fetchTrendingProducts, getFallbackTrendingProducts } from '../services/trendingProductsService';

const PRODUCT_REFRESH_INTERVAL_MS = 30000;

const initialState: AppState = {
  products: [],
  categories: [],
  searchQuery: '',
  selectedCategory: '',
  sortBy: 'rating',
  sortOrder: 'desc',
  isLoading: true,
  isRefreshing: false,
  lastUpdatedAt: null,
  refreshError: null,
  error: null,
};

const mergeProductsById = (currentProducts: Product[], incomingProducts: Product[]): Product[] => {
  const incomingById = new Map(incomingProducts.filter(isRenderableProduct).map((product) => [product.id, product]));
  const seenIds = new Set(currentProducts.map((product) => product.id));

  // Keep existing product positions stable so active category/search views do not jump during refresh.
  const updatedProducts = currentProducts.map((product) => incomingById.get(product.id) ?? product);
  const newProducts = incomingProducts.filter((product) => isRenderableProduct(product) && !seenIds.has(product.id));

  return [...updatedProducts, ...newProducts];
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return {
        ...state,
        products: action.payload,
        categories: getCategories(action.payload),
        isLoading: false,
        isRefreshing: false,
        lastUpdatedAt: Date.now(),
        refreshError: null,
        error: null,
      };
    case 'MERGE_PRODUCTS': {
      const products = mergeProductsById(state.products, action.payload);

      return {
        ...state,
        products,
        categories: getCategories(products),
        isRefreshing: false,
        lastUpdatedAt: Date.now(),
        refreshError: null,
        error: null,
      };
    }
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_SELECTED_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    case 'SET_SORT':
      return {
        ...state,
        sortBy: action.payload.sortBy,
        sortOrder: action.payload.sortOrder,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_REFRESHING':
      return { ...state, isRefreshing: action.payload };
    case 'SET_REFRESH_ERROR':
      return { ...state, refreshError: action.payload, isRefreshing: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false, isRefreshing: false };
    default:
      return state;
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const initializeData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        let products: Product[] = [];

        try {
          products = await fetchTrendingProducts();
        } catch (apiError) {
          console.warn('Falling back to bundled trending products', apiError);
          products = getFallbackTrendingProducts();
        }

        if (products.length === 0) {
          products = getFallbackTrendingProducts();
        }

        products = products.filter(isRenderableProduct);
        await new Promise((resolve) => setTimeout(resolve, 240));

        dispatch({ type: 'SET_PRODUCTS', payload: products });
      } catch (error) {
        console.error('Failed to initialize products', error);
        dispatch({ type: 'SET_ERROR', payload: '商品数据加载失败，请刷新页面后重试。' });
      }
    };

    initializeData();
  }, []);

  useEffect(() => {
    let isDisposed = false;
    let refreshInFlight = false;

    const refreshProducts = async () => {
      if (refreshInFlight || document.visibilityState === 'hidden') {
        return;
      }

      refreshInFlight = true;
      dispatch({ type: 'SET_REFRESHING', payload: true });

      try {
        const products = (await fetchTrendingProducts()).filter(isRenderableProduct);

        if (!isDisposed && products.length > 0) {
          dispatch({ type: 'MERGE_PRODUCTS', payload: products });
        }
      } catch (error) {
        console.warn('Failed to refresh trending products', error);

        if (!isDisposed) {
          dispatch({ type: 'SET_REFRESH_ERROR', payload: '热卖榜更新暂时失败，已保留当前商品。' });
        }
      } finally {
        refreshInFlight = false;

        if (!isDisposed) {
          dispatch({ type: 'SET_REFRESHING', payload: false });
        }
      }
    };

    const intervalId = window.setInterval(refreshProducts, PRODUCT_REFRESH_INTERVAL_MS);
    return () => {
      isDisposed = true;
      window.clearInterval(intervalId);
    };
  }, []);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }

  return context;
};

export const useFilteredProducts = (): Product[] => {
  const { state } = useApp();
  const { products, searchQuery, selectedCategory, sortBy, sortOrder } = state;

  return useMemo(() => {
    let filteredProducts = [...products];

    if (selectedCategory) {
      filteredProducts = filteredProducts.filter((product) => product.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredProducts = filteredProducts.filter((product) =>
        [product.name, product.description, product.category].some((value) =>
          value.toLowerCase().includes(query),
        ),
      );
    }

    filteredProducts.sort((a, b) => {
      const comparison =
        sortBy === 'price'
          ? a.price - b.price
          : sortBy === 'reviewCount'
            ? a.reviewCount - b.reviewCount
            : a.rating - b.rating;

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filteredProducts;
  }, [products, searchQuery, selectedCategory, sortBy, sortOrder]);
};
