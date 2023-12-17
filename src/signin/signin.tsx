import { useState } from 'react';
import styled from 'styled-components';
import logo from '../images/INTRADOGE.png';
import gwlogo from '../images/gw-logo.png';
import axios from 'axios';

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
          <ContentLeft>
              <Logo src={logo} style={{ paddingBottom: "30px" }}/>
              {error && <Error>Something has gone wrong. Maybe try another password?</Error>}
              <FormInput placeholder="Username" onChange={(e: { target: { value: String; }; }) => setUsernameInput(e.target.value)} />
              <FormInput placeholder="Password" type="password" onChange={(e: { target: { value: String; }; })  => setPassword(e.target.value)} onKeyPress={(e: any)  => {
                if ((e.key === 'Enter') && ((e.target as HTMLTextAreaElement).value !== undefined)) {
                  handleLogin()
                }
              }} />
              <LogginButton onClick={() => handleLogin()}>SIGN IN</LogginButton>
              <Error>Sign in using your <a href='https://www.dogetek.no/intraDoge/'>Intradoge</a> user credentials. By signing in you accept that data is stored and managed by Dogetek</Error>

              <Error><div onClick={toGameMode} style={{ color: "#1c0041", textDecoration: "underline", cursor: "pointer"}}>Back to game mode</div></Error>
            </ContentLeft>
        </LeftSide>
        <RightSide>
          <ContentRight>
            <Logo src={gwlogo} />

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
  background-image: linear-gradient(180deg, #203046 0%, #030006 100%);
  @media (max-width: 1160px) {
    display: none;
    width: 0;
  }
`;

const Error = styled.div`
    text-align: center;
    padding-bottom: 20px;
    padding-top: 20px;
    color: #000000;
    margin-left: auto;
    margin-right: auto;
    max-width: 25vw;
    min-width: 300px;
    width: -webkit-fill-available;
`;

const FormInput = styled.input`
    font-family : 'Avenir';
    text-align: center;
    display: block;
    width: 100%;
    padding: .375rem .75rem;
    font-size: 1.2rem;
    line-height: 1.5;
    background-clip: padding-box;
        
    transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;
    max-width: 500px;
    margin: auto;
    border: 1px solid #ced4da;
    margin-bottom: 20px;
    border-radius: 0.25rem;
    width: -webkit-fill-available;
`;

const LogginButton = styled.button`
    text-align: center;
    display: block;
    width: 100%;
    padding: .375rem .75rem;
    font-size: 1rem;
    color: white;
    background-clip: padding-box;
    transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;
    max-width: 500px;
    margin: auto;
    margin-bottom: 30px;
      
    background: #05222f;
       
    border-radius: 0px;
      
    font-family : 'Lato', 'Helvetica', 'Arial', 'sans-serif';
    cursor: pointer;
    width: -webkit-fill-available;
    letter-spacing: 2px;
    text-transform: uppercase;
    border: 1px solid transparent;
    padding: 0.375rem 0.75rem;
    font-weight: 400;
`;

export default Signin;