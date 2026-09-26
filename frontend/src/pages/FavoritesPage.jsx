import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFavorites } from '../api/api';
import FlightCard from '../components/FlightCard';
import { useNavigate } from 'react-router-dom';

export default function FavoritesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    getFavorites(user.id).then(r => setFlights(r.data)).finally(() => setLoading(false));
  }, []);

  const handleFavRemoved = (flightId) => {
    setFlights(prev => prev.filter(f => f.id !== flightId));
  };

  return (
    <div className="container page">
      <div className="fade-up">
        <h2 style={{ fontSize: 32, marginBottom: 8 }}>Избранные рейсы</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>
          Сохранённые направления — нажмите ♥ чтобы убрать
        </p>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : flights.length === 0 ? (
        <div className="empty-state">
          <h3>Нет избранных рейсов</h3>
          <p>Нажмите ♥ на любом рейсе, чтобы сохранить его сюда</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/')}>
            Найти рейсы
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {flights.map(f => (
            <FlightCard
              key={f.id}
              flight={f}
              prices={{
                priceEconomy: f.basePriceEconomy,
                priceStandard: f.basePriceStandard,
                priceBusiness: f.basePriceBusiness,
              }}
              isFav={true}
              onFavToggle={handleFavRemoved}
            />
          ))}
        </div>
      )}
    </div>
  );
}