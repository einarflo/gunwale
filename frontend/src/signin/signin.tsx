import { useState } from 'react';
import styled from 'styled-components';
import whiteLogo from '../images/tavl-white.png';
import axios from 'axios';
import { ErrorText, PrimaryButtonLocal as PrimaryButton, TextInputField } from './gamepin';
import TopLeftLogo from '../components/TopLeftLogo';

interface SiginProps {
  toGameMode: () => void
  setLoggedInUser: (username: String) => void
}

const Signin = ({ toGameMode, setLoggedInUser }: SiginProps) => {
  const [usernameInput, setUsernameInput] = useState<String>("");
  const [password, setPassword] = useState<String>("");
  const [error, setError] = useState(false);

  const handleLogin = () => {
    console.log(usernameInput);
    
    axios.post(`https://www.dogetek.no/intraDoge/login.php`, `username=${usernameInput}&password=${password}`, { headers: { 'content-type': 'application/x-www-form-urlencoded', 'Access-Control-Allow-Origin': '*' } })
      .then(res => {
      console.log(res);
      if (res.status === 200 && res.data.substring(0, 12) !== "Login Failed") {
        setError(false);
        setLoggedInUser(usernameInput)
      } else {
        setError(true);
      }
    })
    .catch(err => {
      console.log(err);
      setError(true);

      // Comment in for local test
      setLoggedInUser("hack")
    });
  };



  return (
    <LoginWrapper>
      
        <LeftSide>
        <TopLeftLogo />
          <ContentLeft>

              {error && <ErrorText>Something has gone wrong. Maybe try another password?</ErrorText>}
              <TextInputField placeholder="Username" onChange={(e: { target: { value: String; }; }) => setUsernameInput(e.target.value)} />
              <TextInputField placeholder="Password" type="password" onChange={(e: { target: { value: String; }; })  => setPassword(e.target.value)} onKeyPress={(e: any)  => {
                if ((e.key === 'Enter') && ((e.target as HTMLTextAreaElement).value !== undefined)) {
                  handleLogin()
                }
              }} />
              <PrimaryButton onClick={() => handleLogin()}>Sign in</PrimaryButton>
            </ContentLeft>
        </LeftSide>
        <RightSide>
          <ContentRight>
            <Logo src={whiteLogo} />

          </ContentRight>

        </RightSide>
    </LoginWrapper>
  );
}

const LoginWrapper = styled.div`
  height: 100dvh;
  width: 100vw;
  position: relative;
  overflow: hidden;
  display: flex;
  background: #1e1b4b;
  &::before{ content:''; position:absolute; inset:0; z-index:0; background:
    radial-gradient(circle at 20% 30%, rgba(99,102,241,0.35) 0%, transparent 60%),
    radial-gradient(circle at 80% 70%, rgba(236,72,153,0.35) 0%, transparent 60%),
    linear-gradient(to bottom right,#4f46e5,#9333ea,#ec4899); opacity:.9; }
  &::after{ content:''; position:absolute; inset:0; z-index:0; background:
    radial-gradient(ellipse at center, rgba(255,255,255,0.05) 0%, transparent 70%);
    animation: glowPulse 6s ease-in-out infinite; opacity:.9; }
`;

const Logo = styled.img`
    max-width: 500px;
    width: -webkit-fill-available;
`;

const ContentLeft = styled.div`
    position: absolute;
    top: 50%;
    left: 25%;
    transform: translate(-50%, -50%);
    min-width: 300px;
    max-width: 80vw;
    @media (max-width: 1160px) {
      left: 50%;
    }
`;

const ContentRight = styled.div`
    position: absolute;
    top: 50%;
    left: 75%;
    transform: translate(-50%, -50%);
    min-width: 300px;
    max-width: 80vw;
    @media (max-width: 1160px) {
      left: 50%;
    }
`;

const LeftSide = styled.div`
  width: 50%;
  @media (max-width: 1160px) {
    width: 100;
  }
  
`;

const RightSide = styled.div`
  width: 50%;
  @media (max-width: 1160px) {
    display: none;
    width: 0;
  }
`;

export default Signin;
