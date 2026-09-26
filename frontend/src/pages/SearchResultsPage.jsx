import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchFlights } from '../api/api';
import FlightCard from '../components/FlightCard';
import './SearchResultsPage.css';

export default function SearchResultsPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!state) { navigate('/'); return; }
    searchFlights({
      origin: state.origin,
      destination: state.destination,
      outboundDate: state.outboundDate,
      returnDate: state.returnDate || null,
      passengers: state.passengers || 1,
    }).then(r => {
      setResults(r.data);
    }).catch(() => setError('Ошибка поиска. Попробуйте снова.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container"><div className="spinner" /></div>;

  return (
    <div className="container page">
      {/* Header */}
      <div className="sr-header fade-up">
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>← Назад</button>
        <div className="sr-title">
          <h2>{state?.origin} → {state?.destination}</h2>
          <span className="text-muted">
            {state?.outboundDate} · {state?.passengers} пасс.
            {state?.returnDate && ` · Обратно: ${state.returnDate}`}
          </span>
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {/* Outbound */}
      <div className="results-section fade-up">
        <h3 className="results-label">✈ Рейсы туда</h3>
        {results?.outbound?.length === 0 ? (
          <div className="empty-state">
            <h3>Рейсов не найдено</h3>
            <p>Попробуйте другую дату или направление</p>
          </div>
        ) : (
          <div className="cards-grid">
            {results?.outbound?.map(item => (
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

      {/* Return */}
      {results?.return && (
        <div className="results-section fade-up-delay">
          <h3 className="results-label">✈ Рейсы обратно</h3>
          {results.return.length === 0 ? (
            <div className="empty-state">
              <h3>Обратных рейсов не найдено</h3>
              <p>Попробуйте другую дату</p>
            </div>
          ) : (
            <div className="cards-grid">
              {results.return.map(item => (
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
      )}
    </div>
  );
}