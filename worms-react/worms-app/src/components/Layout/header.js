//Header.js
import React, { useContext }  from 'react';
import logo from '../../assets/images/Worms.png'; 
import Button from '../elements/button';
import { AuthContext } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Header = ({ isAuthenticated, setIsSidebarOpen, isSidebarOpen }) => {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useContext(AuthContext);

  const onLogout = () => {
      setIsAuthenticated(false);
      localStorage.setItem('isAuthenticated','false');
      navigate('/login');
  };

  return (
      <header className="flex justify-between items-center p-2 bg-white rounded shadow-md w-full fixed top-0 left-0">
        {isAuthenticated && (
          <button
            className="p-2"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <FontAwesomeIcon icon={faBars} className="text-black text-2xl bg-white p-4 rounded-lg mr-0" />
          </button>
        )}
        
        <img src={logo} alt="Logo" className="h-16 ml-0" />
        
        {isAuthenticated && <h1 className="text-xl text-black">Bienvenido worm_1</h1>}
        
        {isAuthenticated && (
          <div>
            <Button
              className={'mr-6'}
              type="button"
              children={"Cerrar Sesión"}
              onClick={onLogout}
            />
          </div>
        )}
      </header>
  );
};

  export default Header;