import styled from 'styled-components';
import logo from '../images/tavl-logo.png';
//import { useHistory } from "react-router-dom";

const TopLeftLogo = () => {
    //const history = useHistory();

    const goHome = () => {
        //history.push("/home")
        window.location.href = "/tavl/"
    }

    return (
        <Logo src={logo} onClick={() => goHome()}/>
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