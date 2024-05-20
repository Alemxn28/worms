// ActuatorsContext.js
import React, { createContext, useState, useContext } from 'react';

const ActuatorsContext = createContext();

export const useActuators = () => useContext(ActuatorsContext);

export const ActuatorsProvider = ({ children }) => {
  const [actuators, setActuators] = useState({
    ventilador: false,
    sistemaRiego: false,
    // Agrega más actuadores si es necesario
  });

  const toggleActuator = (actuatorName) => {
    setActuators((prevActuators) => ({
      ...prevActuators,
      [actuatorName]: !prevActuators[actuatorName],
    }));
  };

  return (
    <ActuatorsContext.Provider value={{ actuators, toggleActuator }}>
      {children}
    </ActuatorsContext.Provider>
  );
};
