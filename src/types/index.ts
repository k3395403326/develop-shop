// 商品属性选项接口
export interface AttributeOption {
  value: string;
  label: string;
  priceModifier?: number;
  imageUrl?: string;
}

// 商品属性接口
export interface ProductAttribute {
  name: string;
  type: 'color' | 'size' | 'specification';
  options: AttributeOption[];
}

// 商品接口
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  description: string;
  category: string;
  attributes: ProductAttribute[];
  stock: number;
  rating: number;
  reviewCount: number;
}

// 购物车商品接口
export interface CartItem {
  productId: string;
  quantity: number;
  selectedAttributes: Record<string, string>;
  addedAt: Date;
}

// 购物车状态接口
export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

// 应用状态接口
export interface AppState {
  products: Product[];
  categories: string[];
  searchQuery: string;
  selectedCategory: string;
  sortBy: 'price' | 'rating' | 'reviewCount';
  sortOrder: 'asc' | 'desc';
  isLoading: boolean;
  isRefreshing: boolean;
  lastUpdatedAt: number | null;
  refreshError: string | null;
  error: string | null;
}

// 搜索筛选参数接口
export interface SearchFilters {
  query: string;
  category: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy: 'price' | 'rating' | 'reviewCount';
  sortOrder: 'asc' | 'desc';
}

// 应用上下文接口
export interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

// 购物车上下文接口
export interface CartContextType {
  cart: CartState;
  addToCart: (productId: string, selectedAttributes: Record<string, string>, quantity?: number) => void;
  removeFromCart: (productId: string, selectedAttributes: Record<string, string>) => void;
  updateQuantity: (productId: string, selectedAttributes: Record<string, string>, quantity: number) => void;
  clearCart: () => void;
}

// 应用动作类型
export type AppAction =
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'MERGE_PRODUCTS'; payload: Product[] }
  | { type: 'SET_CATEGORIES'; payload: string[] }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SELECTED_CATEGORY'; payload: string }
  | { type: 'SET_SORT'; payload: { sortBy: 'price' | 'rating' | 'reviewCount'; sortOrder: 'asc' | 'desc' } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_REFRESHING'; payload: boolean }
  | { type: 'SET_REFRESH_ERROR'; payload: string | null }
  | { type: 'SET_ERROR'; payload: string | null };

// 购物车动作类型
export type CartAction =
  | { type: 'ADD_TO_CART'; payload: { productId: string; selectedAttributes: Record<string, string>; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: { productId: string; selectedAttributes: Record<string, string> } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; selectedAttributes: Record<string, string>; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };
