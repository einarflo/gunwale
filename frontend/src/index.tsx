import React from 'react';
import ReactDOM from 'react-dom/client';
import './soopafresh.ttf';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { KeycloakProvider } from './auth/KeycloakProvider';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const appHeight = () => {
  const doc = document.documentElement
  doc.style.setProperty('--app-height', `${window.innerHeight}px`)
}
window.addEventListener('resize', appHeight)
appHeight()

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <KeycloakProvider>
        <App />
      </KeycloakProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
