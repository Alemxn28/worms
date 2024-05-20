import React, { useContext, useEffect } from 'react';
import Actuator from '../Layout/actuator';
import { faFan, faTint, faPowerOff } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminContext } from '../../states/adminContext';

const Actuators = () => {
  const { monitoringStatus, toggleMonitoring, setMonitoringStatus } = useContext(AdminContext);

  useEffect(() => {
    localStorage.setItem('monitoringStatus', JSON.stringify(monitoringStatus));
  }, [monitoringStatus]);

  useEffect(() => {
    const storedStatus = JSON.parse(localStorage.getItem('monitoringStatus'));
    if (storedStatus !== null) {
      setMonitoringStatus(storedStatus);
    }
  }, [setMonitoringStatus]);

  const sendCommandToRelay = (command) => {
    fetch('http://localhost:3000/actuadores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: command })
    })
    .then(response => response.json())
    .then(data => console.log(data.message))
    .catch(error => console.error('Error:', error));
  };

  return (
    <main className="bg-white p-4 rounded shadow-lg mt-24 mx-auto w-full lg:w-11/12">
      <div className="flex flex-col lg:flex-row items-center justify-center space-y-6 lg:space-y-0 lg:space-x-6">
        <div className="bg-white shadow rounded p-6 flex items-center justify-center flex-col w-full lg:w-1/3">
          <FontAwesomeIcon
            icon={faPowerOff}
            size="4x"
            className={`mb-4 ${monitoringStatus ? 'text-green-500' : 'text-red-500'}`}
            onClick={toggleMonitoring}
          />
          <h2 className="text-xl font-semibold">{monitoringStatus ? 'Sistema Encendido' : 'Sistema Apagado'}</h2>
          <button
            className={`mt-4 px-4 py-2 rounded-full text-white font-bold ${monitoringStatus ? 'bg-green-500' : 'bg-red-500'}`}
            onClick={() => sendCommandToRelay(monitoringStatus ? 'OFF' : 'ON')}
          >
            {monitoringStatus ? 'Apagar' : 'Encender'}
          </button>
        </div>
        <div className="bg-white shadow rounded p-6 w-full lg:w-2/3">
          <h1 className="text-3xl font-bold mb-6 text-center">Actuadores</h1>
          <p className="mb-4 text-center">Aquí puede revisar el estado de los actuadores y modificarlos manualmente</p>
          <div className="flex justify-center flex-wrap space-x-4">
            <Actuator name="Ventilador" icon={faFan} disabled={!monitoringStatus} />
            <Actuator name="Sistema de Riego" icon={faTint} disabled={!monitoringStatus} />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Actuators;
