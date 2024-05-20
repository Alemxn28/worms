import React from 'react';
import { useNavigate } from 'react-router-dom';
import wormImage from '../../assets/images/errorWorm.png'; // Asegúrate de que la ruta sea correcta

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center  lg:justify-normal min-h-screen w-full">
      <h1 className="text-4xl font-bold mb-4 lg:mt-40  text-center">Lo sentimos</h1>
      <p className="text-lg mb-4">Póngase en contacto con el administrador</p>
      <button
        onClick={() => navigate('/')}
        className="px-4 py-2 bg-blue-500 text-white rounded mb-2"
      >
        Volver a inicio
      </button>
      <img
        src={wormImage}
        alt="Gusano"
        className="absolute bottom-0 w-3/12 "
        style={{ left: '50%', transform: 'translateX(-50%)' }}
      />
    </div>
  );
};

export default ErrorPage;