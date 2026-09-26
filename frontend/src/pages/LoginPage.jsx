import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../api/api';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { saveUser } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  const [form, setForm] = useState({ username: '', password: '', fullName: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const fn = mode === 'login' ? login : register;
      const res = await fn(form);
      saveUser(res.data);
      navigate('/');
    } catch (e) {
      setError(e.response?.data?.error || 'Ошибка. Проверьте данные.');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-box fade-up">
        <div className="login-logo">✈ LOWCOST</div>
        <h2>{mode === 'login' ? 'Вход в аккаунт' : 'Регистрация'}</h2>
        <p className="login-sub">
          {mode === 'login'
            ? 'Войдите, чтобы покупать билеты и следить за рейсами'
            : 'Создайте аккаунт — это бесплатно'}
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          {mode === 'register' && (
            <div className="field-group">
              <label>Полное имя</label>
              <input
                placeholder="Иван Иванов"
                value={form.fullName}
                onChange={e => set('fullName', e.target.value)}
                required
              />
            </div>
          )}

          <div className="field-group">
            <label>Логин</label>
            <input
              placeholder="ivan_ivanov"
              value={form.username}
              onChange={e => set('username', e.target.value)}
              required
            />
          </div>

          <div className="field-group">
            <label>Пароль</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              required
            />
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? 'Подождите...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="login-switch">
          {mode === 'login' ? (
            <>Нет аккаунта? <span onClick={() => { setMode('register'); setError(''); }}>Зарегистрироваться</span></>
          ) : (
            <>Уже есть аккаунт? <span onClick={() => { setMode('login'); setError(''); }}>Войти</span></>
          )}
        </div>
      </div>
    </div>
  );
}