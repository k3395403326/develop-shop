import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { CartProvider } from './context/CartContext';
import Header from './components/common/Header';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import SearchResultsPage from './pages/SearchResultsPage';
import CartPage from './pages/CartPage';
import './styles/global.css';

function App() {
  return (
    <AppProvider>
      <CartProvider>
        <Router>
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
        </Router>
      </CartProvider>
    </AppProvider>
  );
}

export default App;
