import { useState } from 'react';
import styled from 'styled-components';
import Dogetek from '../images/Small-Logo.png';

interface SiginProps {
  setUser: (username: String, password: String) => void,
  error: boolean
}

const Signin = ({ setUser, error }: SiginProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    console.log(username);
    setUser(username, password);
  };

  return (
    <SigninScreenWrapper>
      <LoginWrapper>
        {/* <BDSMLogo src={bdsm} /> */}
        <DogetekLogo src={Dogetek} />
        {error && <Error>Something has gone wrong. Maybe try another password?</Error>}
        <FormInput placeholder="Username" onChange={e => setUsername(e.target.value)} />
        <FormInput placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} onKeyPress={(e) => {
          if ((e.key === 'Enter') && ((e.target as HTMLTextAreaElement).value !== undefined)) {
            handleLogin()
          }
        }} />
        < LogginButton onClick={handleLogin} > Sign in</LogginButton>
        <Description>Sign in using your <a href="https://www.dogetek.no/intraDoge" style={{ color: "white" }}>Intradoge</a> user credentials. By signing in you accept that data is stored and managed by Dogetek.</Description>
      </LoginWrapper>
      {/* <Id src={ID} />
       */}
    </SigninScreenWrapper>
  );
}

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
      
        background: linear-gradient(90deg, rgba(3,188,255,1) 0%, rgba(0,255,130,1) 38%, rgba(0,234,255,1) 100%);
        box-shadow: 0 4px 8px 1px rgba(0, 0, 0, 0.4);
       
        border-radius: 8px;
      
        font-family : 'Avenir';
        cursor: pointer;
      `;

const FormInput = styled.input`
        font-family : 'Avenir';
        text-align: center;
        display: block;
        width: 100%;
        padding: .375rem .75rem;
        font-size: 1.2rem;
        line-height: 1.5;
        color: #495057;
        background-image: linear-gradient(120deg, #2C333B 0%, #1E2128 100%);
        background-clip: padding-box;
        
        transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;
        max-width: 500px;
        margin: auto;
        border: none;
        margin-bottom: 20px;
        box-shadow inset 1px 1px 5px #000000;
        border-radius: 8px;
      `;

const Description = styled.div`
        text-align: center;
        padding-bottom: 40px;
        color: #FFFFFF50;
        margin-left: auto;
        margin-right: auto;
        max-width: 25vw;
        min-width: 400px;
      `;

const Error = styled.div`
        text-align: center;
        padding-bottom: 20px;
        padding-top: 20px;
        color: #D53F3F;
        margin-left: auto;
        margin-right: auto;
        max-width: 25vw;
        min-width: 400px;
      `;

const SigninScreenWrapper = styled.div`
        height: 100vh;
        height: 100dvh;
        width: 100vw;
        font-family : 'Avenir';
        background: #ffffff;
      `;

const LoginWrapper = styled.div`
        width: 60vw;
        max-width: 900px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      `;

const DogetekLogo = styled.img`
        height: 3vw;
        width: auto;
        position: absolute;
        bottom: 2%;
        left: 2%;
        min-height: 35px;
      `;

export default Signin;