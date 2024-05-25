import React, { useState, useEffect } from 'react';
import { unparse } from 'papaparse';

const Records = () => {
  const [data, setData] = useState({});
  const [alertMessage, setAlertMessage] = useState('');
  const options = ['Día', 'Semana', 'Mes'];
  const [selectedOption, setSelectedOption] = useState(options[0]);

  // Función para buscar datos desde el servidor
  const fetchData = (option) => {
    let endpoint = option.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const url = `http://localhost:3000/api/data/${endpoint}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (!data || data.error) {
          setData({});
          setAlertMessage(`No existen datos de este ${option.toLowerCase()}.`);
        } else {
          setData(data);
          setAlertMessage('');
        }
      })
      .catch(error => {
        setData({});
        setAlertMessage(`Error al recuperar datos: ${error.message}`);
      });
  };

  useEffect(() => {
    fetchData(selectedOption);
  }, [selectedOption]);

  const handleSelectOption = (option) => {
    setSelectedOption(option);
  };

  const downloadCSV = () => {
    if (!data.humedad || !data.ph || !data.temperatura) {
      setAlertMessage('No existen datos para descargar.');
      return;
    }
    // Obtener la fecha actual y formatearla
  const currentDate = new Date();
  const formattedDate = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;

    const csvData = data.humedad.map((hum, index) => ({
      id_hum: hum.id,
      medida_humedad: hum.data,
      fecha_humedad: hum.created_at,
      id_temp: data.temperatura[index] ? data.temperatura[index].id : '',
      medida_temp: data.temperatura[index] ? data.temperatura[index].DATA : '',
      fecha_temp: data.temperatura[index] ? data.temperatura[index].created_at : '',
      id_ph: data.ph[index] ? data.ph[index].id : '', 
      medida_ph: data.ph[index] ? data.ph[index].DATA : '',
      fecha_ph: data.ph[index] ? data.ph[index].created_at : ''
    }));

    const csv = unparse({
      fields: ["id_hum", "medida_humedad", "fecha_humedad", "id_temp", "medida_temp", "fecha_temp", "id_ph", "medida_ph", "fecha_ph"],
      data: csvData
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Reporte-${formattedDate}.csv`); // Usando la fecha formateada en el nombre del archivo
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="bg-white p-4 rounded shadow-lg mt-24 mx-auto w-full lg:w-11/12">
      <div className="flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md p-6 bg-white rounded shadow-md text-center">
          <h2 className="text-2xl font-bold mb-6">Registros</h2>
          {alertMessage && <p className="text-red-500">{alertMessage}</p>}
          <div className="relative w-full mb-8">
            <div className="flex justify-center space-x-4">
              {options.map((option) => (
                <button
                  key={option}
                  className={`text-lg font-medium rounded-full px-4 py-2 transition-all duration-300 ease-in-out ${
                    selectedOption === option ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                  onClick={() => handleSelectOption(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <button
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={downloadCSV}
              disabled={!data.humedad || !data.ph || !data.temperatura}  // Deshabilita el botón si no hay datos
            >
              Descargar CSV
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Records;
