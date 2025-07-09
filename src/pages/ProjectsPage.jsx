import { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProjectsPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axiosInstance.get('projects/').then(r => setProjects(r.data));
  }, []);

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteProject = id => {
    if (!window.confirm('Удалить проект вместе с задачами?')) return;
    axiosInstance
      .delete(`projects/${id}/`)
      .then(() => setProjects(prev => prev.filter(p => p.id !== id)))
      .catch(() => alert('Не удалось удалить проект'));
  };

  return (
    <div className="projects-wrapper">
      <div className="proj-header">
        <h2>Проекты</h2>
        <div className="proj-actions">
          <input
            className="proj-search"
            placeholder="Поиск..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {['admin', 'manager'].includes(user.role) && (
            <Link to="/projects/new" className="btn">
              + Новый
            </Link>
          )}
        </div>
      </div>

      <ul className="projects-list">
        {filtered.map(p => (
          <li key={p.id} className="project-item">
            <Link to={`/projects/${p.id}/board`}>{p.name}</Link>
            <span className="sub">
              {' '}
              — менеджер: {p.manager_username || '—'}
            </span>

            {['admin', 'manager'].includes(user.role) && (
              <button
                onClick={() => handleDeleteProject(p.id)}
                style={{
                  marginLeft: 8,
                  background: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  padding: '2px 6px',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectsPage;
