import React from 'react';
import ReactDOM from 'react-dom/client'; // Updated import
import './index.css';
import App from './App';
import { PlaylistProvider } from './contexts/PlaylistContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <PlaylistProvider>
      <App />
    </PlaylistProvider>
  </React.StrictMode>
);
