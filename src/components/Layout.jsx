import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './layout/Header';
import Sidebar from './layout/Sidebar';
import Footer from './layout/Footer';
import './Layout.css';

const Layout = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="content-area">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
