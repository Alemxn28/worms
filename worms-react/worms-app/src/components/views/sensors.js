import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const getInitialData = (key) => {
  const storedData = localStorage.getItem(key);
  return storedData ? JSON.parse(storedData) : [];
};

const Sensors = () => {
  const [temperatura1Data, setTemperatura1Data] = useState(getInitialData('temperatura1Data'));
  const [humedad1Data, setHumedad1Data] = useState(getInitialData('humedad1Data'));
  const [temperatura2Data, setTemperatura2Data] = useState(getInitialData('temperatura2Data'));
  const [humedad2Data, setHumedad2Data] = useState(getInitialData('humedad2Data'));
  const [phData, setPhData] = useState(getInitialData('phData'));

  const [currentTemperatura1, setCurrentTemperatura1] = useState(null);
  const [currentHumedad1, setCurrentHumedad1] = useState(null);
  const [currentTemperatura2, setCurrentTemperatura2] = useState(null);
  const [currentHumedad2, setCurrentHumedad2] = useState(null);
  const [currentPh, setCurrentPh] = useState(null);

  useEffect(() => {
    const socket = io('http://localhost:3000');

    socket.on('temperatura1', data => {
      setCurrentTemperatura1(data.value);
      updateChartData('temperatura1Data', temperatura1Data, setTemperatura1Data, data.value);
    });
    socket.on('temperatura2', data => {
      setCurrentTemperatura2(data.value);
      updateChartData('temperatura2Data', temperatura2Data, setTemperatura2Data, data.value);
    });
    socket.on('humedad1', data => {
      setCurrentHumedad1(data.value);
      updateChartData('humedad1Data', humedad1Data, setHumedad1Data, data.value);
    });
    socket.on('humedad2', data => {
      setCurrentHumedad2(data.value);
      updateChartData('humedad2Data', humedad2Data, setHumedad2Data, data.value);
    });
    socket.on('ph1', data => {
      setCurrentPh(data.value);
      updateChartData('phData', phData, setPhData, data.value);
    });

    return () => {
      socket.disconnect();
    };
  }, [temperatura1Data, humedad1Data, temperatura2Data, humedad2Data, phData]);

  const updateChartData = (key, dataArr, setData, newValue) => {
    const newData = [...dataArr, newValue];
    if (newData.length > 10) newData.shift();
    setData(newData);
    localStorage.setItem(key, JSON.stringify(newData));
  };

  const chartOptions = (min, max) => ({
    scales: {
      x: {
        type: 'linear',
        beginAtZero: true
      },
      y: {
        min: min,
        max: max
      }
    },
    elements: {
      line: {
        tension: 0.4
      }
    }
  });

  const createChartData = (data, label) => ({
    labels: Array.from({ length: data.length }, (_, index) => index + 1),
    datasets: [{
      label: label,
      data: data,
      fill: false,
      borderColor: 'rgba(75,192,192,1)'
    }]
  });

  const getWarningMessage = (type, value) => {
    if (value === null) return '';
    switch (type) {
      case 'temperatura':
        if (value < 15) return 'Temperatura baja, considere aumentar la temperatura.';
        if (value > 25) return 'Temperatura alta, considere enfriar el entorno.';
        break;
      case 'humedad':
        if (value < 70) return 'Humedad baja, considere aumentar la humedad.';
        if (value > 90) return 'Humedad alta, considere reducir la humedad.';
        break;
      case 'ph':
        if (value < 6) return 'Nivel de pH bajo, considere agregar cáscaras de huevo.';
        if (value > 7.5) return 'Nivel de pH alto, considere agregar cáscaras de limón.';
        break;
      default:
        return '';
    }
    return '';
  };

  return (
    <main className="bg-white p-4 rounded shadow-lg mt-24 mx-auto w-full lg:w-11/12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Sensor 1 - Temperatura</h2>
          <p className="text-lg text-gray-600 mb-4">
            {currentTemperatura1 !== null ? `Valor actual: ${currentTemperatura1}°C` : 'Cargando...'}
          </p>
          <p className="text-red-500 text-center">{getWarningMessage('temperatura', currentTemperatura1)}</p>
          <Line data={createChartData(temperatura1Data, "Temperatura 1")} options={chartOptions(10, 35)} />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Sensor 1 - Humedad</h2>
          <p className="text-lg text-gray-600 mb-4">
            {currentHumedad1 !== null ? `Valor actual: ${currentHumedad1}%` : 'Cargando...'}
          </p>
          <p className="text-red-500 text-center">{getWarningMessage('humedad', currentHumedad1)}</p>
          <Line data={createChartData(humedad1Data, "Humedad 1")} options={chartOptions(0, 100)} />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Sensor 2 - Temperatura</h2>
          <p className="text-lg text-gray-600 mb-4">
            {currentTemperatura2 !== null ? `Valor actual: ${currentTemperatura2}°C` : 'Cargando...'}
          </p>
          <p className="text-red-500 text-center">{getWarningMessage('temperatura', currentTemperatura2)}</p>
          <Line data={createChartData(temperatura2Data, "Temperatura 2")} options={chartOptions(10, 35)} />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Sensor 2 - Humedad</h2>
          <p className="text-lg text-gray-600 mb-4">
            {currentHumedad2 !== null ? `Valor actual: ${currentHumedad2}%` : 'Cargando...'}
          </p>
          <p className="text-red-500 text-center">{getWarningMessage('humedad', currentHumedad2)}</p>
          <Line data={createChartData(humedad2Data, "Humedad 2")} options={chartOptions(0, 100)} />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Sensor de pH</h2>
          <p className="text-lg text-gray-600 mb-4">
            {currentPh !== null ? `Valor actual: ${currentPh}` : 'Cargando...'}
          </p>
          <p className="text-red-500 text-center">{getWarningMessage('ph', currentPh)}</p>
          <Line data={createChartData(phData, "pH1")} options={chartOptions(0, 14)} />
        </div>
      </div>
    </main>
  );
};

export default Sensors;
