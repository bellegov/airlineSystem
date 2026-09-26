import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllUsers, deleteUser, updateUser, createFlight, deleteFlight } from '../api/api';
import { useNavigate } from 'react-router-dom';
import './AdminPage.css';

const EMPTY_FLIGHT = {
  flightNumber: '', origin: '', destination: '',
  departureTime: '', arrivalTime: '', flightDuration: '',
  airplaneModel: '', totalSeats: 100,
  basePriceEconomy: 0, basePriceStandard: 0, basePriceBusiness: 0,
};

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Flight form
  const [flightForm, setFlightForm] = useState(EMPTY_FLIGHT);
  const [flightMsg, setFlightMsg] = useState('');
  const [flightLoading, setFlightLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') { navigate('/'); return; }
    getAllUsers().then(r => setUsers(r.data)).finally(() => setLoading(false));
  }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Удалить пользователя?')) return;
    try {
      await deleteUser(id, user.id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch { alert('Ошибка удаления'); }
  };

  const handleToggleRole = async (u) => {
    const newRole = u.role === 'ADMIN' ? 'CLIENT' : 'ADMIN';
    try {
      const res = await updateUser(u.id, { ...u, role: newRole });
      setUsers(prev => prev.map(x => x.id === u.id ? res.data : x));
    } catch { alert('Ошибка обновления'); }
  };

  const setFF = (k, v) => setFlightForm(f => ({ ...f, [k]: v }));

  const handleCreateFlight = async (e) => {
    e.preventDefault();
    setFlightLoading(true);
    setFlightMsg('');
    try {
      await createFlight(flightForm, user.id);
      setFlightMsg('✅ Рейс создан!');
      setFlightForm(EMPTY_FLIGHT);
    } catch (err) {
      setFlightMsg('❌ ' + (err.response?.data?.error || 'Ошибка создания'));
    }
    setFlightLoading(false);
  };

  return (
    <div className="container page">
      <div className="admin-header fade-up">
        <h2>Панель администратора</h2>
        <span className="tag tag-gold">👑 ADMIN</span>
      </div>

      <div className="admin-tabs">
        <button className={`tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
          Пользователи {users.length > 0 && <span className="tab-count">{users.length}</span>}
        </button>
        <button className={`tab ${tab === 'flights' ? 'active' : ''}`} onClick={() => setTab('flights')}>
          Создать рейс
        </button>
      </div>

      {/* USERS TABLE */}
      {tab === 'users' && (
        <div className="fade-up">
          {loading ? <div className="spinner" /> : (
            <div className="card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Логин</th>
                    <th>Имя</th>
                    <th>Роль</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className={u.id === user.id ? 'self-row' : ''}>
                      <td className="dim">#{u.id}</td>
                      <td><b>{u.username}</b></td>
                      <td>{u.fullName || '—'}</td>
                      <td>
                        <span className={`tag ${u.role === 'ADMIN' ? 'tag-gold' : 'tag-blue'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          {u.id !== user.id && (
                            <>
                              <button
                                className="btn btn-ghost btn-xs"
                                onClick={() => handleToggleRole(u)}
                              >
                                {u.role === 'ADMIN' ? '→ CLIENT' : '→ ADMIN'}
                              </button>
                              <button
                                className="btn btn-danger btn-xs"
                                onClick={() => handleDeleteUser(u.id)}
                              >
                                Удалить
                              </button>
                            </>
                          )}
                          {u.id === user.id && <span className="dim">Это вы</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CREATE FLIGHT FORM */}
      {tab === 'flights' && (
        <div className="card fade-up">
          <h3 style={{ marginBottom: 24 }}>Новый рейс</h3>
          <form onSubmit={handleCreateFlight} className="flight-form">
            <div className="form-row-3">
              <div className="field-group">
                <label>Номер рейса</label>
                <input placeholder="LC-1042" value={flightForm.flightNumber} onChange={e => setFF('flightNumber', e.target.value)} required />
              </div>
              <div className="field-group">
                <label>Откуда</label>
                <input placeholder="Москва" value={flightForm.origin} onChange={e => setFF('origin', e.target.value)} required />
              </div>
              <div className="field-group">
                <label>Куда</label>
                <input placeholder="Берлин" value={flightForm.destination} onChange={e => setFF('destination', e.target.value)} required />
              </div>
            </div>

            <div className="form-row-3">
              <div className="field-group">
                <label>Вылет</label>
                <input type="datetime-local" value={flightForm.departureTime} onChange={e => setFF('departureTime', e.target.value)} required />
              </div>
              <div className="field-group">
                <label>Прилёт</label>
                <input type="datetime-local" value={flightForm.arrivalTime} onChange={e => setFF('arrivalTime', e.target.value)} required />
              </div>
              <div className="field-group">
                <label>Продолжительность</label>
                <input placeholder="2ч 30м" value={flightForm.flightDuration} onChange={e => setFF('flightDuration', e.target.value)} required />
              </div>
            </div>

            <div className="form-row-3">
              <div className="field-group">
                <label>Самолёт</label>
                <input placeholder="Boeing 737" value={flightForm.airplaneModel} onChange={e => setFF('airplaneModel', e.target.value)} required />
              </div>
              <div className="field-group">
                <label>Всего мест</label>
                <input type="number" min={1} value={flightForm.totalSeats} onChange={e => setFF('totalSeats', +e.target.value)} required />
              </div>
            </div>

            <div className="divider" />
            <h4 style={{ marginBottom: 16 }}>Базовые цены (€)</h4>
            <div className="form-row-3">
              <div className="field-group">
                <label>Эконом</label>
                <input type="number" min={0} step="0.01" value={flightForm.basePriceEconomy} onChange={e => setFF('basePriceEconomy', +e.target.value)} required />
              </div>
              <div className="field-group">
                <label>Стандарт</label>
                <input type="number" min={0} step="0.01" value={flightForm.basePriceStandard} onChange={e => setFF('basePriceStandard', +e.target.value)} required />
              </div>
              <div className="field-group">
                <label>Бизнес</label>
                <input type="number" min={0} step="0.01" value={flightForm.basePriceBusiness} onChange={e => setFF('basePriceBusiness', +e.target.value)} required />
              </div>
            </div>

            {flightMsg && (
              <div className={flightMsg.includes('✅') ? 'success-msg' : 'error-msg'}>
                {flightMsg}
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={flightLoading}>
              {flightLoading ? 'Создаём...' : '+ Создать рейс'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}