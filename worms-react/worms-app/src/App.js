import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Layout/header';
import Sidebar from './components/Layout/sidebar';
import Sensors from './components/views/sensors';
import LoginForm from './components/views/loginForm';
import Actuators from './components/views/actuators';
import AdminPanel from './components/views/administrator';
import Records from './components/views/records';
import ErrorPage from './components/views/errorPage';

function App() {
  const { isAuthenticated } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsSidebarOpen(false);
    }
  }, [isAuthenticated]);

  return (
    <BrowserRouter>
      <div className="relative min-h-screen bg-gradient-to-r from-sky-400 via-sky-200 to-sky-300">
        <Header
          isAuthenticated={isAuthenticated}
          setIsSidebarOpen={setIsSidebarOpen}
          isSidebarOpen={isSidebarOpen}
        />
        {isAuthenticated && (
          <div
            className={`fixed rounded-md mt-24 z-20 transition-all ease-in-out duration-300 transform ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } bg-white h-full shadow-md w-64 overflow-hidden`}
          >
            <Sidebar />
          </div>
        )}
        <div className={`flex flex-grow transition-margin duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <Routes>
            <Route path="/" element={isAuthenticated ? <Navigate to="/sensores" /> : <LoginForm />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/sensores" /> : <LoginForm />} />
            <Route path="/sensores" element={isAuthenticated ? <Sensors /> : <Navigate to="/login" />} />
            <Route path="/actuadores" element={isAuthenticated ? <Actuators /> : <Navigate to="/login" />} />
            <Route path="/administrador" element={isAuthenticated ? <AdminPanel /> : <Navigate to="/login" />} />
            <Route path="/registros" element={isAuthenticated ? <Records /> : <Navigate to="/login" />} />
            <Route path="/forget" element={<ErrorPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
