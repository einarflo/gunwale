import { useEffect } from 'react';
import { useKeycloak } from './KeycloakProvider';

const Login = () => {
  const { login } = useKeycloak();
  useEffect(() => {
    login();
  }, [login]);
  return null;
};

export default Login;
