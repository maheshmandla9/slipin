import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { checkStorageHealth } from './lib/recovery';
import { initErrorReporting } from './lib/sentry';
import './index.css';

// Storage health must be checked BEFORE the store hydrates; the store module
// evaluates when App is imported, so App is loaded dynamically after the check.
checkStorageHealth();
initErrorReporting();

void Promise.all([import('./App'), import('./config/app')]).then(([appModule, config]) => {
  const App = appModule.default;
  document.title = config.APP_NAME;
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );
});
