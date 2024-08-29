import { useState } from 'react';
import styled from 'styled-components';
import whiteLogo from '../images/tavl-white.png';
import axios from 'axios';
import { ErrorText, Footer, PrimaryButtonLocal as PrimaryButton, TextInputField } from './gamepin';
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

  //select color - maybe 5 circles?
  // diffent power ups for each color, maybe some sort of name?

  // Should be an upgrade getting black with gold letters

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
              <Footer>or create a new user&nbsp;<div onClick={() => {}} style={{ color: "#9084FA", textDecoration: "underline", fontFamily: "Coll", cursor: "pointer" }}>here</div>.</Footer>
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
    height: 100vh;
    height: 100dvh;
    width: 100vw;
    background: #ffffff;
    display: flex;
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
  background-image: linear-gradient(180deg, #6A71FA 0%, #9C8AFA 100%);
  @media (max-width: 1160px) {
    display: none;
    width: 0;
  }
`;

export default Signin;