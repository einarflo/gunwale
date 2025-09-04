import styled from 'styled-components';
import logo from '../images/tavl-logo.png';
import { useNavigate } from 'react-router-dom';
import { useKeycloak } from '../auth/KeycloakProvider';

const TopLeftLogo = () => {
    const { isAuthenticated } = useKeycloak();
    const navigate = useNavigate();

    return (
        <Logo src={logo} onClick={() => navigate(isAuthenticated ? '/home' : '/')}/>
    );
};

export default TopLeftLogo;

const Logo = styled.img`
  padding-top: 20px;
  padding-right: 40px;
  padding-left: 40px;
  height 40px;
  padding-bottom: 25px;
  cursor: pointer;
  position: absolute;
  left: 0;
`;