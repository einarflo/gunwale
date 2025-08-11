import styled from 'styled-components';
import logo from '../images/tavl-logo.png';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';

const TopLeftLogo = () => {
    const { username } = useContext(UserContext);
    const navigate = useNavigate();

    const goHome = () => {
        if (username) {
            navigate('/tv');
        } else {
            navigate('/');
        }
    };

    return (
        <Logo src={logo} onClick={goHome}/>
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