// src/pages/CreateProjectPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";

const CreateProjectPage = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [manager, setManager] = useState("");
  const [managers, setManagers] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance
      .get("/users/", { params: { role: "manager" } })
      .then((res) => setManagers(res.data))
      .catch(() => setError("Ошибка загрузки менеджеров"));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    axiosInstance
      .post("/projects/", {
        name,
        description,
        start_date: startDate,
        end_date: endDate,
        manager_id: manager || null,
      })
      .then((res) => navigate(`/projects/${res.data.id}/board`))
      .catch(() => setError("Ошибка при создании проекта"));
  };

  return (
    <div className="content">
      <h2>Создать проект</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        <input placeholder="Название" value={name} onChange={(e) => setName(e.target.value)} required />
        <textarea placeholder="Описание" value={description} onChange={(e) => setDescription(e.target.value)} required />
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
        <select value={manager} onChange={(e) => setManager(e.target.value)}>
          <option value="">Менеджер (необязательно)</option>
          {managers.map((m) => (
            <option key={m.id} value={m.id}>
              {m.username}
            </option>
          ))}
        </select>
        <button type="submit">Создать</button>
      </form>
    </div>
  );
};

export default CreateProjectPage;
