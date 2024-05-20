import React, { useContext } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext'; // Asegúrate de que la ruta sea correcta

const PrivateRoute = ({ element: Element, ...rest }) => {
    const { isAuthenticated } = useContext(AuthContext);

    return (
        <Route
            {...rest}
            element={isAuthenticated ? Element : <Navigate to="/login" replace />}
        />
    );
};

export default PrivateRoute;
