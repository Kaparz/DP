import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="page-title">DIPLOM&nbsp;PM</div>

      {user && (
        <ul className="navbar-links">
          {/* ----------- общие ссылки ----------- */}
          <li>
            <Link to="/">Главная</Link>
          </li>
          <li>
            <Link to="/projects">Проекты</Link>
          </li>

          {/* ----------- только admin/manager ----------- */}
          {['admin', 'manager'].includes(user.role) && (
            <>
              <li>
                <Link to="/projects/new">Создать проект</Link>
              </li>
              <li>
                <Link to="/report">Создать отчёт</Link>
              </li>
            </>
          )}

          {/* ----------- выход ----------- */}
          <li>
            <button
              onClick={logout}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              Выйти&nbsp;({user.username})
            </button>
          </li>
        </ul>
      )}
    </header>
  );
};

export default Navbar;
