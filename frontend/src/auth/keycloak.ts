import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'https://auth.tavl.no',
  realm: 'tavl',
  clientId: 'frontend'
});

export default keycloak;
