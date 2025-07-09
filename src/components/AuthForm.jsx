// src/components/AuthForm.jsx
import { useState } from "react";
import axiosInstance from "../api/axios";

const AuthForm = ({ onAuthSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axiosInstance.post("/token/", { username, password });
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      onAuthSuccess();
    } catch {
      setError("Неверное имя пользователя или пароль");
    }
  };

  return (
    <form onSubmit={handleLogin} className="auth-form">
      <h2>Вход</h2>
      {error && <p className="error">{error}</p>}
      <input placeholder="Имя пользователя" value={username} onChange={(e) => setUsername(e.target.value)} required />
      <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <button type="submit">Войти</button>
    </form>
  );
};

export default AuthForm;

<div style={{textAlign:'center',marginTop:'8px'}}>
  <a href="/register">Создать аккаунт</a>
</div>