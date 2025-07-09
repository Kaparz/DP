// src/pages/LoginPage.jsx
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthForm from '../components/AuthForm';
import { useEffect, useState } from 'react';

const LoginPage = () => {
  const navigate          = useNavigate();
  const { setUser }       = useAuth();
  const [params]          = useSearchParams();
  const [justRegistered, setJustRegistered] = useState(false);

  /* показываем уведомление, если пришли с /register?registered=1 */
  useEffect(() => {
    if (params.get('registered') === '1') {
      setJustRegistered(true);
      const timer = setTimeout(() => setJustRegistered(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [params]);

  const handleAuthSuccess = () => {
    // токен уже сохранён внутри AuthForm → декодируем и переходим
    const token = localStorage.getItem('access');
    setUser(token ? JSON.parse(atob(token.split('.')[1])) : null);
    navigate('/');
  };

  return (
    <div className="login-page">
      {justRegistered && (
        <p style={{ textAlign: 'center', color: '#28a745', marginBottom: '8px' }}>
          Регистрация прошла успешно. Войдите под своим аккаунтом.
        </p>
      )}

      <AuthForm onAuthSuccess={handleAuthSuccess} />

      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <Link to="/register">Создать аккаунт</Link>
      </div>
    </div>
  );
};

export default LoginPage;
