import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { CartProvider } from './context/CartContext';
import Header from './components/common/Header';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import SearchResultsPage from './pages/SearchResultsPage';
import CartPage from './pages/CartPage';
import AdminPage from './pages/AdminPage';
import './styles/global.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* 管理后台（独立页面，不显示商城的 Header）*/}
        <Route path="/admin" element={<AdminPage />} />
        {/* 商城前台 */}
        <Route path="/*" element={
          <AppProvider>
            <CartProvider>
              <div className="App">
                <Header />
                <main>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/product/:id" element={<ProductDetailPage />} />
                    <Route path="/search" element={<SearchResultsPage />} />
                    <Route path="/cart" element={<CartPage />} />
                  </Routes>
                </main>
              </div>
            </CartProvider>
          </AppProvider>
        } />
      </Routes>
    </Router>
  );
}

export default App;
