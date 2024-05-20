import React from 'react';
import { Link, useLocation } from 'react-router-dom';  

const Sidebar = () => {
  const location = useLocation();

  const linkClasses = (path) => 
    `block py-4 rounded italic ${location.pathname === path ? 'bg-gradient-to-r from-sky-400 via-sky-200 to-white text-black text-center font-semibold' : 'text-gray-800 hover:bg-gray-100'}`;

  return (
    <aside className="mt-24 pl-4 mx-1 bg-white rounded-lg shadow-lg h-full">
      <nav>
        <ul className="list-none p-0">
          <li className="mb-2">
            <Link to="/administrador" className={linkClasses('/administrador')}>
              Administrador
            </Link>
          </li>
          <li className="mb-2">
            <Link to="/sensores" className={linkClasses('/sensores')}>
              Sensores
            </Link>
          </li>
          <li className="mb-2">
            <Link to="/registros" className={linkClasses('/registros')}>
              Registros
            </Link>
          </li>
          <li className="mb-2">
            <Link to="/actuadores" className={linkClasses('/actuadores')}>
              Actuadores
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
