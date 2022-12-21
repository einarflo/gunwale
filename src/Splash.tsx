import styled from 'styled-components';
import logo from './images/gunwale-logo-white.png';

const Splash = () => {
  return (
    <SplashScreenWrapper>
      <Logo src={logo} />
    </SplashScreenWrapper>
  );
}

const SplashScreenWrapper = styled.div`
  height: 100vh;
  width: 100vw;
  background: rgb(28,0,65);
  background: linear-gradient(180deg, rgba(28,0,65,1) 0%, rgba(45,56,112,1) 0%, rgba(21,2,43,1) 100%);
`;

export const Logo = styled.img`
  width: 30vw;
  max-width: 400px;
  min-width: 250px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export default Splash;