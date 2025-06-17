import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Suppress ResizeObserver warnings
const suppressResizeObserverErrors = () => {
  const resizeObserverError = console.error.bind(console);
  console.error = (error, ...args) => {
    if (
      typeof error === 'string' &&
      error.includes('ResizeObserver loop completed with undelivered notifications')
    ) {
      return;
    }
    resizeObserverError(error, ...args);
  };
};

suppressResizeObserverErrors();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 