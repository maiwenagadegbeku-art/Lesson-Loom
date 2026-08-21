import React, { useEffect } from 'react';
import './App.css';
import { AppProvider } from './contexts/AppContext';
import Layout from './components/Layout';

function App() {
  useEffect(() => {
    // Register service worker for PWA / offline support
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').catch(() => {});
      });
    }
  }, []);

  return (
    <AppProvider>
      <Layout />
    </AppProvider>
  );
}

export default App;
