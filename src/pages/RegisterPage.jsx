// src/pages/RegisterPage.jsx
import { useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const nav = useNavigate();
  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '',
    password: '', password2: ''
  });
  const [error, setError] = useState('');

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('/register/', form);
      nav('/login?registered=1');          // → страница входа
    } catch (err) {
      setError('Ошибка регистрации');
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Регистрация</h2>
      {error && <p className="error">{error}</p>}
      <input name="username"   placeholder="Имя пользователя"
             value={form.username} onChange={handleChange} required />
      <input name="email" type="email" placeholder="Email"
             value={form.email} onChange={handleChange} required />
      <input name="first_name" placeholder="Имя"
             value={form.first_name} onChange={handleChange} required />
      <input name="last_name"  placeholder="Фамилия"
             value={form.last_name} onChange={handleChange} required />
      <input name="password" type="password" placeholder="Пароль"
             value={form.password} onChange={handleChange} required />
      <input name="password2" type="password" placeholder="Повтор пароля"
             value={form.password2} onChange={handleChange} required />
      <button type="submit">Создать аккаунт</button>
      <div style={{textAlign:'center',marginTop:'8px'}}>
        <a href="/login">Уже есть аккаунт?</a>
      </div>
    </form>
  );
};

export default RegisterPage;
