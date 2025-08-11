import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { KeycloakProvider } from './auth/KeycloakProvider';
import App from './App';

jest.mock('keycloak-js', () => {
  return jest.fn().mockImplementation(() => ({
    init: jest.fn().mockResolvedValue(false),
    login: jest.fn(),
    logout: jest.fn(),
    updateToken: jest.fn().mockResolvedValue(false),
    token: undefined,
    authenticated: false
  }));
});

test('renders landing page', () => {
  render(
    <BrowserRouter>
      <KeycloakProvider>
        <App />
      </KeycloakProvider>
    </BrowserRouter>
  );
  const linkElement = screen.getByText(/join game/i);
  expect(linkElement).toBeInTheDocument();
});
