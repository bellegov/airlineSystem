import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCities, getRecommended } from '../api/api';
import FlightCard from '../components/FlightCard';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const [cities, setCities] = useState({ origins: [], destinations: [] });
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tripType, setTripType] = useState('one'); // 'one' | 'round'

  const [form, setForm] = useState({
    origin: '', destination: '',
    outboundDate: '', returnDate: '',
    passengers: 1,
  });

  useEffect(() => {
    getCities().then(r => setCities(r.data)).catch(() => {});
    getRecommended().then(r => setRecommended(r.data)).catch(() => {});
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!form.origin || !form.destination || !form.outboundDate) return;
    setLoading(true);
    navigate('/search', {
      state: {
        origin: form.origin,
        destination: form.destination,
        outboundDate: form.outboundDate,
        returnDate: tripType === 'round' ? form.returnDate : null,
        passengers: form.passengers,
      }
    });
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container hero-content fade-up">
          <div className="hero-label">Авиакомпания нового поколения</div>
          <h1>Летите туда,<br />куда хочется</h1>
          <p>Низкие цены. Прямые рейсы. Без переплат.</p>
        </div>
      </section>

      {/* Search Form */}
      <div className="container">
        <div className="search-box fade-up">
          {/* Trip type toggle */}
          <div className="trip-toggle">
            <button
              className={`toggle-btn ${tripType === 'one' ? 'active' : ''}`}
              onClick={() => setTripType('one')}
            >В одну сторону</button>
            <button
              className={`toggle-btn ${tripType === 'round' ? 'active' : ''}`}
              onClick={() => setTripType('round')}
            >Туда-Обратно</button>
          </div>

          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-fields">
              <div className="field-group">
                <label>Откуда</label>
                <select value={form.origin} onChange={e => set('origin', e.target.value)} required>
                  <option value="">Выберите город</option>
                  {cities.origins.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="swap-icon">⇄</div>

              <div className="field-group">
                <label>Куда</label>
                <select value={form.destination} onChange={e => set('destination', e.target.value)} required>
                  <option value="">Выберите город</option>
                  {cities.destinations.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="field-group">
                <label>Дата туда</label>
                <input
                  type="date" min={today}
                  value={form.outboundDate}
                  onChange={e => set('outboundDate', e.target.value)}
                  required
                />
              </div>

              {tripType === 'round' && (
                <div className="field-group">
                  <label>Дата обратно</label>
                  <input
                    type="date" min={form.outboundDate || today}
                    value={form.returnDate}
                    onChange={e => set('returnDate', e.target.value)}
                  />
                </div>
              )}

              <div className="field-group field-sm">
                <label>Пассажиры</label>
                <input
                  type="number" min={1} max={9}
                  value={form.passengers}
                  onChange={e => set('passengers', +e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary search-btn" disabled={loading}>
              {loading ? 'Ищем...' : ' Найти рейсы'}
            </button>
          </form>
        </div>
      </div>

      {/* Recommendations */}
      <div className="container page">
        <div className="section-header">
          <h2>Рекомендуемые рейсы</h2>
          <span className="text-muted">Популярные направления прямо сейчас</span>
        </div>
        {recommended.length === 0 ? (
          <div className="spinner" />
        ) : (
          <div className="cards-grid">
            {recommended.map(item => (
              <FlightCard
                key={item.flight.id}
                flight={item.flight}
                prices={item}
                availableSeats={item.availableSeats}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}