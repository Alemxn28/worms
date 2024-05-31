// AdminPanel.js
import React, { useState, useContext } from 'react';
import { AdminContext } from '../../states/adminContext';

const AdminPanel = () => {
  const { changeCredentials } = useContext(AdminContext);
  const [newCredentials, setNewCredentials] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (e) => {
    setNewCredentials({ ...newCredentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newCredentials.username || !newCredentials.password || !newCredentials.confirmPassword) {
      alert('Todos los campos son obligatorios.');
      return;
    }

    if (newCredentials.password !== newCredentials.confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    try {
      const response = await fetch('/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: newCredentials.username,
          password: newCredentials.password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Usuario registrado con éxito');
        setNewCredentials({ username: '', password: '', confirmPassword: '' });
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al registrar el usuario');
    }
  };

  return (
    <main className="bg-white p-4 rounded shadow-lg mt-24 mx-auto w-full lg:w-11/12">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
        <div className="w-full lg:w-1/2 bg-white shadow rounded p-6">
          <div className="bg-white shadow rounded p-6">
            <h2 className="text-xl font-semibold mb-4">Registrar Usuario</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2" htmlFor="username">Nombre de usuario</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={newCredentials.username}
                  onChange={handleInputChange}
                  className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2" htmlFor="password">Contraseña</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={newCredentials.password}
                  onChange={handleInputChange}
                  className="border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-bold mb-2" htmlFor="confirmPassword">Confirmar contraseña</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={newCredentials.confirmPassword}
                  onChange={handleInputChange}
                  className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="submit"
                >
                  Registrar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminPanel;
