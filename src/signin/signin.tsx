import { useState } from 'react';
import styled from 'styled-components';
import logo from '../images/gunwale-logo.png';
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

  return (
    <LoginWrapper>
        <Content>
            <Logo src={logo} />
            {error && <Error>Something has gone wrong. Maybe try another password?</Error>}
            <FormInput placeholder="Username" onChange={(e: { target: { value: String; }; }) => setUsernameInput(e.target.value)} />
            <FormInput placeholder="Password" type="password" onChange={(e: { target: { value: String; }; })  => setPassword(e.target.value)} onKeyPress={(e: { key: string; target: HTMLTextAreaElement; })  => {
              if ((e.key === 'Enter') && ((e.target as HTMLTextAreaElement).value !== undefined)) {
                handleLogin()
              }
            }} />
            <LogginButton onClick={() => handleLogin()}>Sign in</LogginButton>
            <Error><div onClick={toGameMode} style={{ color: "#1c0041", textDecoration: "underline"}}>Game mode</div></Error>
        </Content>
        <Footer>Sign in using your <a href="https://www.dogetek.no/intraDoge" style={{ color: "#1c0041" }}>Intradoge</a> user credentials. By signing in you accept that data is stored and managed by Dogetek.</Footer>
    </LoginWrapper>
  );
}

const LoginWrapper = styled.div`
    height: 100vh;
    width: 100vw;
    background: #ffffff;
`;

const Logo = styled.img`
    max-width: 400px;
    width: -webkit-fill-available;
`;

const Content = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 300px;
    max-width: 80vw;
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
    border: 3px solid rgb(28,0,65);
    margin-bottom: 20px;
    border-radius: 8px;
    width: -webkit-fill-available;
`;

const LogginButton = styled.div`
    text-align: center;
    display: block;
    width: 100%;
    padding: .375rem .75rem;
    font-size: 1.2rem;
    font-weight: bold;
    line-height: 1.5;
    color: white;
    background-clip: padding-box;
    transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;
    max-width: 500px;
    margin: auto;
    margin-bottom: 30px;
      
    background: rgb(28,0,65);
    background: linear-gradient(90deg, rgba(28,0,65,1) 0%, rgba(45,56,112,1) 0%, rgba(21,2,43,1) 100%);
    box-shadow: 0 4px 8px 1px rgba(0, 0, 0, 0.4);
       
    border-radius: 8px;
      
    font-family : 'Avenir';
    cursor: pointer;
    width: -webkit-fill-available;
`;

const Footer = styled.div`
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 300px;
    max-width: 80vw;
    color: #00000080;
    font-size: 1rem;
    text-align: center;
`;

export default Signin;