import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { initBooking } from '../api/api';
import './BookingPage.css';

const CLASSES = [
  { key: 'ECONOMY',  label: 'Эконом',  priceKey: 'priceEconomy',  desc: 'Стандартное место, ручная кладь' },
  { key: 'STANDARD', label: 'Стандарт', priceKey: 'priceStandard', desc: 'Больше места для ног, приоритет' },
  { key: 'BUSINESS', label: 'Бизнес',  priceKey: 'priceBusiness', desc: 'Широкое кресло, питание включено' },
];

const EXTRAS = [
  { key: 'hasLuggage',  label: 'Багаж',                  price: 50,  icon: '🧳' },
  { key: 'hasPriority', label: 'Приоритетная посадка',  price: 15,  icon: '⚡' },
  { key: 'hasMeal',     label: 'Питание на борту',        price: 20,  icon: '🍽' },
];

export default function BookingPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { flight, prices } = state || {};
  if (!flight) { navigate('/'); return null; }

  const [seatClass, setSeatClass] = useState('ECONOMY');
  const [extras, setExtras] = useState({ hasLuggage: false, hasPriority: false, hasMeal: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleExtra = (k) => setExtras(e => ({ ...e, [k]: !e[k] }));

  const basePrice = prices?.[CLASSES.find(c => c.key === seatClass)?.priceKey] ?? 0;
  const extrasTotal = EXTRAS.reduce((s, e) => s + (extras[e.key] ? e.price : 0), 0);
  const total = ((basePrice + extrasTotal) * (state?.passengers || 1)).toFixed(2);

  const fmt = (dt) => dt ? new Date(dt).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : '—';

  const handleBook = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await initBooking({
        userId: user.id,
        outboundFlightId: flight.id,
        returnFlightId: null,
        seatClass,
        passengers: state?.passengers || 1,
        ...extras,
      });
      navigate('/payment', { state: { ticket: res.data, total } });
    } catch (e) {
      setError(e.response?.data?.error || 'Ошибка бронирования');
    }
    setLoading(false);
  };

  return (
    <div className="container page">
      <div className="booking-layout fade-up">
        {/* Left: Options */}
        <div className="booking-main">
          <h2 className="booking-title">Оформление билета</h2>

          {/* Flight Summary */}
          <div className="card flight-summary">
            <div className="summary-route">
              <div>
                <div className="sum-time">{flight.origin}</div>
                <div className="sum-label">{fmt(flight.departureTime)}</div>
              </div>
              <div className="sum-arrow">→</div>
              <div className="right">
                <div className="sum-time">{flight.destination}</div>
                <div className="sum-label">{fmt(flight.arrivalTime)}</div>
              </div>
            </div>
            <div className="summary-meta">
              <span className="tag tag-blue">{flight.airplaneModel}</span>
              <span className="tag tag-blue">{flight.flightDuration}</span>
              <span className="tag tag-blue">{state?.passengers} пасс.</span>
            </div>
          </div>

          {/* Seat Class */}
          <div className="section-block">
            <h3>Класс обслуживания</h3>
            <div className="class-grid">
              {CLASSES.map(c => (
                <div
                  key={c.key}
                  className={`class-card ${seatClass === c.key ? 'selected' : ''}`}
                  onClick={() => setSeatClass(c.key)}
                >
                  <div className="class-name">{c.label}</div>
                  <div className="class-desc">{c.desc}</div>
                  <div className="class-price">€{prices?.[c.priceKey] ?? '—'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Extras */}
          <div className="section-block">
            <h3>Дополнительные услуги</h3>
            <div className="extras-list">
              {EXTRAS.map(e => (
                <label key={e.key} className={`extra-item ${extras[e.key] ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={extras[e.key]}
                    onChange={() => toggleExtra(e.key)}
                  />
                  <span className="extra-icon">{e.icon}</span>
                  <span className="extra-label">{e.label}</span>
                  <span className="extra-price">+€{e.price}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div className="booking-sidebar">
          <div className="card order-summary">
            <h3>Итог заказа</h3>
            <div className="divider" />
            <div className="order-lines">
              <div className="order-line">
                <span>Класс {CLASSES.find(c => c.key === seatClass)?.label}</span>
                <span>€{basePrice}</span>
              </div>
              {EXTRAS.filter(e => extras[e.key]).map(e => (
                <div key={e.key} className="order-line">
                  <span>{e.label}</span>
                  <span>+€{e.price}</span>
                </div>
              ))}
              <div className="order-line">
                <span>Пассажиры</span>
                <span>×{state?.passengers || 1}</span>
              </div>
            </div>
            <div className="divider" />
            <div className="order-total">
              <span>Итого</span>
              <span className="total-price">€{total}</span>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '16px' }}
              onClick={handleBook}
              disabled={loading}
            >
              {loading ? 'Бронируем...' : 'Перейти к оплате →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}