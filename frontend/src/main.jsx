import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter } from 'react-router-dom';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* 1. BrowserRouter por fora */}
      <AuthProvider> {/* 2. AuthProvider por dentro */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);