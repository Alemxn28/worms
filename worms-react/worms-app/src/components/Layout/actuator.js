import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useActuators } from '../../states/actuatorsContext';

const Actuator = ({ name, icon, disabled }) => {
  const { actuators, toggleActuator } = useActuators();
  const isActive = actuators[name];

  return (
    <div className="flex flex-col items-center p-4 m-10 bg-gray-200 rounded-lg shadow">
      <h1 className={`font-black text-xl mb-8 ${disabled ? 'text-gray-400' : ''}`}>{name}</h1>
      <FontAwesomeIcon icon={icon} className={`text-9xl ${isActive ? 'text-green-500' : 'text-red-500'} ${disabled ? 'text-blue-300' : ''}`} />
      <button
        className={`mt-4 px-20 py-6 rounded-full font-bold ${isActive && !disabled ? 'bg-green-500 text-white' : !disabled ? 'bg-red-500 text-white' : 'bg-gray-400 text-gray-400'} ${disabled ? 'cursor-not-allowed' : ''}`}
        onClick={() => !disabled && toggleActuator(name)}
        disabled={disabled}
      >
        {!disabled && (isActive ? 'Encendido' : 'Apagado')}
      </button>
    </div>
  );
};

export default Actuator;
