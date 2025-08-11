import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'https://auth.tavl.no',
  realm: 'Tavl',
  clientId: 'tavl-frontend'
});

export default keycloak;
