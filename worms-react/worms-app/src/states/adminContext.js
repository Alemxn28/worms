import React, { createContext, useState, useEffect } from 'react';

// Crear el contexto para el panel de administrador
export const AdminContext = createContext();

// Crear el proveedor del contexto
export const AdminProvider = ({ children }) => {
  const [monitoringStatus, setMonitoringStatus] = useState(false); // false significa apagado, true encendido
  const [credentials, setCredentials] = useState({
    username: 'worm_1',
    password: '****', // Debería ser manejado de forma más segura
  });

  // Función para cambiar las credenciales de usuario
  const changeCredentials = (newUsername, newPassword) => {
    setCredentials({
      username: newUsername,
      password: newPassword,
    });
    // Aquí iría la lógica para actualizar las credenciales en el backend
  };

  // Función para alternar el estado del sistema de monitoreo
  const toggleMonitoring = () => {
    setMonitoringStatus(!monitoringStatus);
    // Aquí iría la lógica para activar/desactivar el sistema en el backend
  };

  // Guardar el estado del monitoreo en localStorage
  useEffect(() => {
    localStorage.setItem('monitoringStatus', JSON.stringify(monitoringStatus));
  }, [monitoringStatus]);

  // Cargar el estado del monitoreo desde localStorage
  useEffect(() => {
    const storedStatus = JSON.parse(localStorage.getItem('monitoringStatus'));
    if (storedStatus !== null) {
      setMonitoringStatus(storedStatus);
    }
  }, []);

  // El valor que se pasa a los consumidores del contexto
  const contextValue = {
    monitoringStatus,
    toggleMonitoring,
    credentials,
    changeCredentials,
    setMonitoringStatus, // Asegurarse de incluir setMonitoringStatus en el contexto
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};