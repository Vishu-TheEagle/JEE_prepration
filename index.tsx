import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { MistakeProvider } from './contexts/MistakeContext';
import { GamificationProvider } from './contexts/GamificationContext';
import { LocaleProvider } from './contexts/LocaleContext';
import { CommunityProvider } from './contexts/CommunityContext';
import { registerServiceWorker } from './utils/offline';
import { Toaster } from 'react-hot-toast';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <SettingsProvider>
        <LocaleProvider>
          <MistakeProvider>
            <GamificationProvider>
              <CommunityProvider>
                <Toaster
                  position="top-center"
                  reverseOrder={false}
                  toastOptions={{
                    className: '',
                    style: {
                      background: '#333',
                      color: '#fff',
                    },
                  }}
                />
                <App />
              </CommunityProvider>
            </GamificationProvider>
          </MistakeProvider>
        </LocaleProvider>
      </SettingsProvider>
    </AuthProvider>
  </React.StrictMode>
);

registerServiceWorker();