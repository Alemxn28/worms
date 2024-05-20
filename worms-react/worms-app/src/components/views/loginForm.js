//LoginForm.js
import React, { useState, useContext, useEffect } from 'react';
import Button from '../elements/button';
import { AuthContext } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { setIsAuthenticated } = useContext(AuthContext);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/sensores');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (data.status === 'ok') {
        localStorage.setItem('isAuthenticated', 'true');
        setIsAuthenticated(true);
        navigate('/sensores');
      } else {
        setErrorMsg('Inicio de sesión fallido');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMsg('Error al enviar la solicitud.');
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center">
      <div className="p-8 rounded w-full max-w-sm">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
          <p className="text-3xl text-center font-bold">Ingrese su usuario y contraseña</p>
          <p className="text-sm text-center">Le recomendamos cambiar la contraseña por default</p>
          <label htmlFor="username" className="text-sm font-bold text-center max-w-lg">
            NOMBRE DE USUARIO:
          </label>
          <input
            id="username"
            name="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="px-3 py-2 border rounded"
            placeholder="worm_1"
            required
          />
          <label htmlFor="password" className="text-sm font-bold text-center">
            CONTRASEÑA:
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-3 py-2 border rounded"
            placeholder="****"
            required
          />
          <a href="/forget" className="text-indigo-600 hover:underline text-center">
            ¿Olvidaste tu contraseña?
          </a>
          <div className="text-center">
            <Button className="w-1/2" type="submit" children="Enviar" />
          </div>
          {errorMsg && <p className="text-red-500 text-sm text-center">{errorMsg}</p>}
        </form>
      </div>
    </div>
  );
};

export default LoginForm;