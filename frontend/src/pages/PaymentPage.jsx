import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { processPayment } from '../api/api';
import './PaymentPage.css';

export default function PaymentPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { ticket, total } = state || {};

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // 'success' | 'fail'

  if (!ticket) { navigate('/'); return null; }

  const fmtCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const fmtExp = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
  };

  const handlePay = async (success) => {
    if (!cardNumber || !expiry || !cvv) return;
    setLoading(true);
    try {
      await processPayment(ticket.id, success);
      setResult(success ? 'success' : 'fail');
    } catch {}
    setLoading(false);
  };

  // Simulate random fail for realism
  const handleRealPay = () => {
    const success = Math.random() > 0.0; // 85% успех
    handlePay(success);
  };

  if (result === 'success') {
    return (
      <div className="container page">
        <div className="payment-result success fade-up">
          <div className="result-icon">✅</div>
          <h2>Оплата прошла успешно!</h2>
          <p>Билет #{ticket.id} оформлен и сохранён в вашем профиле.</p>
          <div className="result-actions">
            <button className="btn btn-primary" onClick={() => navigate('/profile')}>Мои билеты</button>
            <button className="btn btn-ghost" onClick={() => navigate('/')}>На главную</button>
          </div>
        </div>
      </div>
    );
  }

  if (result === 'fail') {
    return (
      <div className="container page">
        <div className="payment-result fail fade-up">
          <div className="result-icon">❌</div>
          <h2>Оплата отклонена</h2>
          <p>Банк отказал в проведении транзакции. Попробуйте другую карту.</p>
          <div className="result-actions">
            <button className="btn btn-primary" onClick={() => setResult(null)}>Попробовать снова</button>
            <button className="btn btn-ghost" onClick={() => navigate('/')}>На главную</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container page">
      <div className="payment-layout fade-up">
        {/* Card Form */}
        <div className="payment-form card">
          <h2>Оплата</h2>
          <p className="pay-subtitle">Введите данные карты для оплаты</p>

          <div className="card-visual">
            <div className="cv-number">{cardNumber || '•••• •••• •••• ••••'}</div>
            <div className="cv-bottom">
              <span>{expiry || 'ММ/ГГ'}</span>
              <span className="cv-brand">💳</span>
            </div>
          </div>

          <div className="form-fields">
            <div className="field-group">
              <label>Номер карты</label>
              <input
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={e => setCardNumber(fmtCard(e.target.value))}
                maxLength={19}
              />
            </div>
            <div className="form-row">
              <div className="field-group">
                <label>Срок действия</label>
                <input
                  placeholder="ММ/ГГ"
                  value={expiry}
                  onChange={e => setExpiry(fmtExp(e.target.value))}
                  maxLength={5}
                />
              </div>
              <div className="field-group">
                <label>CVV</label>
                <input
                  placeholder="•••"
                  type="password"
                  value={cvv}
                  onChange={e => setCvv(e.target.value.slice(0, 3))}
                  maxLength={3}
                />
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary pay-btn"
            onClick={handleRealPay}
            disabled={loading || !cardNumber || !expiry || !cvv}
          >
            {loading ? 'Обрабатываем...' : `Оплатить €${total}`}
          </button>

          <p className="pay-hint">🔒 Ваши данные защищены шифрованием</p>
        </div>

        {/* Order summary */}
        <div className="payment-summary card">
          <h3>Ваш заказ</h3>
          <div className="divider" />
          <div className="ps-line">
            <span>Билет #{ticket.id}</span>
          </div>
          <div className="ps-line">
            <span>Класс</span>
            <span>{ticket.seatClass}</span>
          </div>
          <div className="ps-line">
            <span>Пассажиры</span>
            <span>{ticket.passengersCount}</span>
          </div>
          {ticket.hasLuggage && <div className="ps-line"><span>🧳 Багаж</span><span>+€50</span></div>}
          {ticket.hasPriority && <div className="ps-line"><span>⚡ Приоритет</span><span>+€15</span></div>}
          {ticket.hasMeal && <div className="ps-line"><span>🍽 Питание</span><span>+€20</span></div>}
          <div className="divider" />
          <div className="ps-total">
            <span>Итого</span>
            <span>€{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}