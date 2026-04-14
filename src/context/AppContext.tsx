import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { AppAction, AppContextType, AppState, Product } from '../types';
import { getCategories, isRenderableProduct } from '../utils/dataGenerator';
import { fetchTrendingProducts, getFallbackTrendingProducts } from '../services/trendingProductsService';

const initialState: AppState = {
  products: [],
  categories: [],
  searchQuery: '',
  selectedCategory: '',
  sortBy: 'rating',
  sortOrder: 'desc',
  isLoading: true,
  error: null,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return {
        ...state,
        products: action.payload,
        isLoading: false,
        error: null,
      };
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
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
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
        const categories = getCategories(products);

        await new Promise((resolve) => setTimeout(resolve, 240));

        dispatch({ type: 'SET_PRODUCTS', payload: products });
        dispatch({ type: 'SET_CATEGORIES', payload: categories });
      } catch (error) {
        console.error('Failed to initialize products', error);
        dispatch({ type: 'SET_ERROR', payload: '商品数据加载失败，请刷新页面后重试。' });
      }
    };

    initializeData();
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
