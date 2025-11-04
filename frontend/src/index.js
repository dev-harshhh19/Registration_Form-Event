import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/dark-theme.css';
import App from './App';

// Silence console in production to avoid printing any logs in deployed apps
if (process.env.NODE_ENV === 'production' || process.env.REACT_APP_SILENT_LOGS === 'true') {
  // override common console methods to no-op
  ['log', 'info', 'warn', 'error', 'debug'].forEach((m) => {
    if (console[m]) console[m] = () => {};
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 