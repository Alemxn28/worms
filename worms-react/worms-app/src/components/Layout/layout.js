import React from 'react';
import Header from './header';

const MainLayout = ({ children, userName }) => {
  return (
    <div className="grid grid-cols-4">
      <Sidebar />
      <div className="col-span-3">
        <Header userName={userName} />
        <main className="m-4 bg-white p-5 rounded shadow-lg">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
