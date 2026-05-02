import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { Toaster } from 'react-hot-toast';
import { apiGet } from '@/services/api';
import { initSentry } from '@/utils/sentry';
import App from './App';
import './styles/globals.css';

initSentry();

const swrConfig = {
  fetcher: apiGet,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  refreshInterval: 60000,
  dedupingInterval: 5000,
  errorRetryCount: 3,
  onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
    if (error?.response?.status >= 400 && error?.response?.status < 500) return;
    if (retryCount >= 3) return;
    setTimeout(() => revalidate({ retryAttempt: retryCount }), Math.min(1000 * 2 ** retryCount, 30000));
  },
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <SWRConfig value={swrConfig}>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#2C3E50',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            },
            success: {
              iconTheme: { primary: '#2ECC71', secondary: '#fff' }
            },
            error: {
              iconTheme: { primary: '#E74C3C', secondary: '#fff' }
            }
          }}
        />
      </SWRConfig>
    </BrowserRouter>
  </React.StrictMode>
);
