import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyTickets, updateProfile } from '../api/api';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, saveUser } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState({ active: [], archive: [] });
  const [tab, setTab] = useState('active');
  const [loading, setLoading] = useState(true);

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ fullName: user?.fullName || '', password: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    getMyTickets(user.id).then(r => setTickets(r.data)).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateProfile(user.id, form);
      saveUser({ ...user, ...res.data });
      setMsg('Профиль обновлён!');
      setEditMode(false);
    } catch {
      setMsg('Ошибка обновления');
    }
    setSaving(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const fmt = (dt) => dt ? new Date(dt).toLocaleString('ru-RU', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : '—';

  const displayTickets = tickets[tab] || [];

  return (
    <div className="container page">
      <div className="profile-layout fade-up">
        {/* Sidebar: Profile info */}
        <div className="profile-sidebar">
          <div className="card profile-card">
            <div className="avatar">{(user?.fullName || user?.username || '?')[0].toUpperCase()}</div>
            <div className="profile-name">{user?.fullName || user?.username}</div>
            <div className="profile-role">
              <span className={`tag ${user?.role === 'ADMIN' ? 'tag-gold' : 'tag-blue'}`}>
                {user?.role === 'ADMIN' ? '👑 Администратор' : '✈ Клиент'}
              </span>
            </div>
            <div className="profile-username">@{user?.username}</div>

            <div className="divider" />

            {!editMode ? (
              <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => setEditMode(true)}>
                Редактировать профиль
              </button>
            ) : (
              <div className="edit-form">
                <div className="field-group">
                  <label>Полное имя</label>
                  <input
                    value={form.fullName}
                    onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                  />
                </div>
                <div className="field-group">
                  <label>Новый пароль</label>
                  <input
                    type="password"
                    placeholder="Оставьте пустым"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  />
                </div>
                {msg && <div className={`msg ${msg.includes('Ошибка') ? 'error-msg' : 'success-msg'}`}>{msg}</div>}
                <div className="edit-actions">
                  <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Сохраняем...' : 'Сохранить'}
                  </button>
                  <button className="btn btn-ghost" onClick={() => setEditMode(false)}>Отмена</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main: Tickets */}
        <div className="profile-main">
          <div className="tickets-header">
            <h2>Мои билеты</h2>
            <div className="tabs">
              <button className={`tab ${tab === 'active' ? 'active' : ''}`} onClick={() => setTab('active')}>
                Активные {tickets.active?.length > 0 && <span className="tab-count">{tickets.active.length}</span>}
              </button>
              <button className={`tab ${tab === 'archive' ? 'active' : ''}`} onClick={() => setTab('archive')}>
                Архив
              </button>
            </div>
          </div>

          {loading ? (
            <div className="spinner" />
          ) : displayTickets.length === 0 ? (
            <div className="empty-state">
              <h3>{tab === 'active' ? 'Нет активных билетов' : 'Архив пуст'}</h3>
              <p>{tab === 'active' ? 'Найдите и купите свой первый рейс!' : 'Прошлые поездки появятся здесь'}</p>
              {tab === 'active' && (
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/')}>
                  Найти рейс
                </button>
              )}
            </div>
          ) : (
            <div className="tickets-list">
              {displayTickets.map(t => (
                <div key={t.id} className={`ticket-card card ${tab === 'archive' ? 'archived' : ''}`}>
                  <div className="ticket-top">
                    <div className="ticket-route">
                      <span className="tk-city">{t.outboundFlight?.origin}</span>
                      <span className="tk-arrow">✈</span>
                      <span className="tk-city">{t.outboundFlight?.destination}</span>
                    </div>
                    <span className={`tag ${tab === 'active' ? 'tag-green' : 'tag-blue'}`}>
                      #{t.id}
                    </span>
                  </div>

                  <div className="ticket-details">
                    <div className="td-item">
                      <span>Вылет</span>
                      <b>{fmt(t.outboundFlight?.departureTime)}</b>
                    </div>
                    <div className="td-item">
                      <span>Класс</span>
                      <b>{t.seatClass}</b>
                    </div>
                    <div className="td-item">
                      <span>Пассажиры</span>
                      <b>{t.passengersCount}</b>
                    </div>
                    <div className="td-item">
                      <span>Итого</span>
                      <b className="price-highlight">€{t.finalPrice}</b>
                    </div>
                  </div>

                  <div className="ticket-extras">
                    {t.hasLuggage && <span className="tag tag-blue">🧳 Багаж</span>}
                    {t.hasPriority && <span className="tag tag-gold">⚡ Приоритет</span>}
                    {t.hasMeal && <span className="tag tag-blue">🍽 Питание</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}