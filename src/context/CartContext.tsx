import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { CartState, CartAction, CartContextType, CartItem } from '../types';

// 初始购物车状态
const initialCartState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0
};

// 购物车Reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { productId, selectedAttributes, quantity } = action.payload;
      const existingItemIndex = state.items.findIndex(item => 
        item.productId === productId && 
        JSON.stringify(item.selectedAttributes) === JSON.stringify(selectedAttributes)
      );

      let newItems: CartItem[];
      
      if (existingItemIndex >= 0) {
        // 如果商品已存在，增加数量
        newItems = state.items.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // 添加新商品
        const newItem: CartItem = {
          productId,
          selectedAttributes,
          quantity,
          addedAt: new Date()
        };
        newItems = [...state.items, newItem];
      }

      return calculateCartTotals({ ...state, items: newItems });
    }

    case 'REMOVE_FROM_CART': {
      const { productId, selectedAttributes } = action.payload;
      const newItems = state.items.filter(item => 
        !(item.productId === productId && 
          JSON.stringify(item.selectedAttributes) === JSON.stringify(selectedAttributes))
      );
      
      return calculateCartTotals({ ...state, items: newItems });
    }

    case 'UPDATE_QUANTITY': {
      const { productId, selectedAttributes, quantity } = action.payload;
      
      if (quantity <= 0) {
        // 如果数量为0或负数，删除商品
        return cartReducer(state, { 
          type: 'REMOVE_FROM_CART', 
          payload: { productId, selectedAttributes } 
        });
      }

      const newItems = state.items.map(item => 
        item.productId === productId && 
        JSON.stringify(item.selectedAttributes) === JSON.stringify(selectedAttributes)
          ? { ...item, quantity }
          : item
      );

      return calculateCartTotals({ ...state, items: newItems });
    }

    case 'CLEAR_CART':
      return initialCartState;

    case 'LOAD_CART':
      return calculateCartTotals({ ...state, items: action.payload });

    default:
      return state;
  }
};

// 计算购物车总计
const calculateCartTotals = (state: CartState): CartState => {
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  // 注意：这里我们需要从产品数据中获取价格，暂时设为0，后续在组件中计算
  const totalPrice = 0; // 将在组件中通过产品数据计算实际价格
  
  return {
    ...state,
    totalItems,
    totalPrice
  };
};

// 创建Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// 本地存储键名
const CART_STORAGE_KEY = 'jd-shopping-cart';

// Provider组件
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, initialCartState);

  // 从本地存储加载购物车数据
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const cartItems: CartItem[] = JSON.parse(savedCart);
        // 恢复Date对象
        const itemsWithDates = cartItems.map(item => ({
          ...item,
          addedAt: new Date(item.addedAt)
        }));
        dispatch({ type: 'LOAD_CART', payload: itemsWithDates });
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    }
  }, []);

  // 保存购物车数据到本地存储
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart.items));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [cart.items]);

  // 添加到购物车
  const addToCart = (
    productId: string, 
    selectedAttributes: Record<string, string>, 
    quantity: number = 1
  ) => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: { productId, selectedAttributes, quantity }
    });
  };

  // 从购物车移除
  const removeFromCart = (
    productId: string, 
    selectedAttributes: Record<string, string>
  ) => {
    dispatch({
      type: 'REMOVE_FROM_CART',
      payload: { productId, selectedAttributes }
    });
  };

  // 更新数量
  const updateQuantity = (
    productId: string, 
    selectedAttributes: Record<string, string>, 
    quantity: number
  ) => {
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { productId, selectedAttributes, quantity }
    });
  };

  // 清空购物车
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

// Hook for using cart context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};