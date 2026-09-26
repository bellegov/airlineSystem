import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';
import ProfilePage from './pages/ProfilePage';
import FavoritesPage from './pages/FavoritesPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import './index.css';
import './pages/HomePage.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"         element={<HomePage />} />
          <Route path="/search"   element={<SearchResultsPage />} />
          <Route path="/booking"  element={<BookingPage />} />
          <Route path="/payment"  element={<PaymentPage />} />
          <Route path="/profile"  element={<ProfilePage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/admin"    element={<AdminPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}