import { useAuth } from '../context/AuthContext';
import { toggleFavorite } from '../api/api';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FlightCard.css';

export default function FlightCard({ flight, prices, availableSeats, isFav = false, onFavToggle }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fav, setFav] = useState(isFav);
  const [loading, setLoading] = useState(false);

  const fmt = (dt) => {
    if (!dt) return '—';
    const d = new Date(dt);
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const fmtDate = (dt) => {
    if (!dt) return '';
    return new Date(dt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const handleFav = async (e) => {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    setLoading(true);
    try {
      await toggleFavorite(user.id, flight.id);
      setFav(!fav);
      if (onFavToggle) onFavToggle(flight.id);
    } catch {}
    setLoading(false);
  };

  const handleBook = () => {
    if (!user) { navigate('/login'); return; }
    navigate('/booking', { state: { flight, prices, availableSeats } });
  };

  const economyPrice = prices?.priceEconomy ?? flight?.basePriceEconomy ?? '—';

  return (
    <div className="flight-card fade-up">
      <div className="flight-card-header">
        <div className="flight-route">
          <div className="city">
            <span className="time">{fmt(flight.departureTime)}</span>
            <span className="code">{flight.origin}</span>
          </div>
          <div className="flight-line">
            <span className="duration">{flight.flightDuration}</span>
            <div className="line"><span className="plane">✈</span></div>
            <span className="date">{fmtDate(flight.departureTime)}</span>
          </div>
          <div className="city right">
            <span className="time">{fmt(flight.arrivalTime)}</span>
            <span className="code">{flight.destination}</span>
          </div>
        </div>

        <button
          className={`fav-btn ${fav ? 'active' : ''}`}
          onClick={handleFav}
          disabled={loading}
          title={fav ? 'Убрать из избранного' : 'В избранное'}
        >♥</button>
      </div>

      <div className="divider" />

      <div className="flight-card-footer">
        <div className="flight-meta">
          <span className="tag tag-blue">{flight.airplaneModel}</span>
          <span className="tag tag-green">{availableSeats ?? '?'} мест</span>
          {availableSeats <= 5 && <span className="tag tag-red">Мало мест!</span>}
        </div>

        <div className="price-block">
          <div className="price-tiers">
            <div className="tier">
              <span>Эконом</span>
              <b>€{prices?.priceEconomy ?? economyPrice}</b>
            </div>
            <div className="tier">
              <span>Стандарт</span>
              <b>€{prices?.priceStandard ?? flight?.basePriceStandard ?? '—'}</b>
            </div>
            <div className="tier biz">
              <span>Бизнес</span>
              <b>€{prices?.priceBusiness ?? flight?.basePriceBusiness ?? '—'}</b>
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleBook}>Выбрать</button>
        </div>
      </div>
    </div>
  );
}