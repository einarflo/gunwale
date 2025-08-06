import { useState } from "react";
import styled, { keyframes } from "styled-components";
import logo from '../images/tavl-logo.png';
import { ErrorText, TextInputField, PrimaryButtonLocal as PrimaryButton, Logo } from "./gamepin";
import TopLeftLogo from "../components/TopLeftLogo";

interface UsernameProps {
    error: boolean,
    loading: boolean,
    setName: (name: string | undefined) => void
}

const Username = ({ setName, loading, error }: UsernameProps) => {
    const [username, setUsername] = useState<string | undefined>("");
    const [validationError, setValidationError] = useState<string | undefined>("");

    const validateName = (input: any) => {
            // Sjekk lengden på strengen
    if (input && input.length > 50) {
        setValidationError("Username too long!");
        return false;
    }

    /*

    // Sjekk om strengen kun inneholder bokstaver og tall
    const regex = /^[a-zA-Z0-9]*$/;
    if (input && !regex.test(input)) {
        setValidationError("Username contains special characters");
        return false;
    }

    */

    return true;
    }

    return(
    <GamePinWrapper>
        <TopLeftLogo />
        <Content>
            <Logo src={logo} />
            {
                loading ? <Spinner/> :
                <>
                    {error && <ErrorText>Already taken. Try another pls?</ErrorText>}
                    {validationError && <ErrorText>{validationError}</ErrorText>}
                    <TextInputField placeholder="Username" onChange={(e: { target: { value: String; }; }) => setUsername(e.target.value.toString())} onKeyPress={(e: any)  => {
                        if ((e.key === 'Enter') && ((e.target as HTMLTextAreaElement).value !== undefined)) {
                            setValidationError("");
                            if (validateName(username)) {
                                setName(username)
                            }
                        }
                    }}/>
                    <PrimaryButton onClick={() => {
                        setValidationError("");
                        if (validateName(username)) {
                            setName(username)
                        }
                    }}>GO!</PrimaryButton>
                </>
            }
            
        </Content>
    </GamePinWrapper>)
}

const GamePinWrapper = styled.div`
    height: 100vh;
    height: 100dvh;
    width: 100vw;
    background: #ffffff;
`;

const Content = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 300px;
    max-width: 80vw;
`;


const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

const Spinner = styled.div`
width: 50px;
height: 50px;
margin-left: auto;
margin-right: auto;
left: 50%;
border: 3px solid rgba(255,255,255,.3);
border-radius: 50%;
border-top-color: #fff;
animation: spin 1s ease-in-out infinite;
-webkit-animation: ${rotate} 1s ease-in-out infinite;
`;
export default Username;

