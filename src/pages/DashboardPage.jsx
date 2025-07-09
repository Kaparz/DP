// src/pages/DashboardPage.jsx
import { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const dayMs = 24 * 60 * 60 * 1000;

const DashboardPage = () => {
  const { user } = useAuth();

  const [myTasks,    setMyTasks]    = useState([]);
  const [critical,   setCritical]   = useState([]);
  const [myProjects, setMyProjects] = useState([]);

  /* --- загрузка --- */
  useEffect(() => {
    /* все мои задачи */
    axiosInstance.get('tasks/', { params: { mine: true } })
      .then(r => {
        setMyTasks(r.data);

        // фильтруем «срочные»
        const now = new Date();
        const crit = r.data.filter(t => {
          if (t.status === 'done') return false;
          const dl = new Date(t.deadline);
          const diff = (dl - now) / dayMs;      // в днях
          return diff <= 2;                     // ≤ 2 дней или просрочена (diff < 0)
        });
        setCritical(crit);
      });

    /* проекты (первые 4) */
    axiosInstance.get('projects/')
      .then(r => setMyProjects(r.data.slice(0, 4)));
  }, []);

  /* счётчики статусов */
  const sum = myTasks.reduce(
    (acc, t) => ({ ...acc, [t.status]: (acc[t.status] || 0) + 1 }),
    {}
  );

  return (
    <div className="dashboard">
      <h1 className="dash-title">Привет, <b>{user?.username}</b>!</h1>

      <div className="dash-grid">
        {/* статистика */}
        <section className="card stat-card">
          <h3>Мои задачи</h3>
          <ul>
            <li><span className="dot todo" />К выполнению — {sum.todo || 0}</li>
            <li><span className="dot inprogress" />В&nbsp;процессе — {sum.in_progress || 0}</li>
            <li><span className="dot pause" />Пауза — {sum.pause || 0}</li>
            <li><span className="dot review" />Проверка — {sum.review || 0}</li>
            <li><span className="dot done" />Готово — {sum.done || 0}</li>
          </ul>
        </section>

        {/* срочные */}
        <section className="card critical-card">
          <h3>Срочные&nbsp;({critical.length})</h3>
          {critical.length === 0 ? (
            <p>Просроченных или «горящих» задач нет.</p>
          ) : (
            <ul>
              {critical.slice(0, 5).map(t => (
                <li key={t.id}>
                  <Link to={`/projects/${t.project}/board`}>{t.title}</Link>
                  &nbsp;— до&nbsp;{t.deadline}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* проекты */}
        <section className="card proj-card">
          <h3>Мои проекты</h3>
          {myProjects.length === 0 ? (
            <p>Нет назначенных проектов.</p>
          ) : (
            <ul>
              {myProjects.map(p => (
                <li key={p.id}>
                  <Link to={`/projects/${p.id}/board`}>{p.name}</Link>
                </li>
              ))}
            </ul>
          )}
          <div className="more">
            <Link to="/projects">Все проекты →</Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
