import axios, { AxiosRequestConfig } from "axios";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { GameWrapper, Header, MobileSpinner, Points, Username } from "./game";
import { ItemImage, ItemImageMobile, MobileNav } from "../landing";
import TopLeftLogo from "../components/TopLeftLogo";
import TopRightPoints from "../components/TopRightPoints";
import { selectableColors } from "./waiting";
import one from '../images/upgrades/1.png';
import two from '../images/upgrades/2.png';
import three from '../images/upgrades/3.png';
import four from '../images/upgrades/4.png';
import five from '../images/upgrades/5.png';
import six from '../images/upgrades/6.png';
import seven from '../images/upgrades/7.png';
import eight from '../images/upgrades/8.png';

interface ResultProps {
  username: String
  currentQ: number
  points: number
  nextQuestionStarted: () => void
  gameFinished: () => void
  gamepin: String
  fif: boolean;
  buyfif: () => void
  setPoints: (points: number) => void
  stop: boolean;
  buyStop: () => void
  color: number;
}

const Result = ({ currentQ, username, points, nextQuestionStarted, gamepin, gameFinished, fif, buyfif, setPoints, buyStop, stop, color }: ResultProps) => {
  
  const [getReady, setGetReady] = useState(false);

  const countdown = useCallback((startTime: string) => {
    const countdownTimer = setInterval(() => {
      if (!moment(startTime, "HH:mm:ss").isAfter(moment(), 'second')) {
        setGetReady(false);
        nextQuestionStarted();
        clearInterval(countdownTimer)
      }
    }, (500));
  }, [nextQuestionStarted])

  const purchaseFifityFifty = () => {
    if (!fif) {
      setPoints(points-250);
      buyfif();
    }
  }

  const purchaseStopTime = () => {
    if (!stop) {
      setPoints(points-200);
      buyStop();
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      axios.get(`https://www.dogetek.no/api/api.php/game_instance/${gamepin}/?hash=${Math.random() * 21991919393914999419}`, { mode: 'no-cors' } as AxiosRequestConfig<any>)
      .then(res => {
        if (res.data["status"] === 'started') {
          if (res.data["currentquestion"] === currentQ.toString()) {

            // Start countdown to next question
            countdown(res.data["starttime"]);
            setGetReady(true);
            
            clearInterval(interval)
            
            
          }
        }
        if (res.data["status"] === 'finished'){
          gameFinished()
        }
      })
      .catch(err => {
        console.log("Error when getting game status");
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown, currentQ, gameFinished, gamepin]);



  const upgrades = [
    {
      image: <ItemImage src={one}/>,
      imageMobile: <ItemImageMobile src={one}/>,
      header: "Remove false answers",
      description: "Removes at least two false alternatives."
    },
    {
      image: <ItemImage src={two}/>,
      imageMobile: <ItemImageMobile src={two}/>,
      header: "Full point score",
      description: "Get full score when choosing the correct alternative, like the clock was back to start."
    },
    {
      image: <ItemImage src={three}/>,
      imageMobile: <ItemImageMobile src={three}/>,
      header: "Gear up your score",
      description: "Score multiplyer that increases the amount of points you earn per question."
    },
    {
      image: <ItemImage src={four}/>,
      imageMobile: <ItemImageMobile src={four}/>,
      header: "Eye in the sky",
      description: "See what your oppontents are answrering in real time."
    },
    {
      image: <ItemImage src={five}/>,
      imageMobile: <ItemImageMobile src={five}/>,
      header: "Shield protection",
      description: "Protects you from sabotage from other players."
    },
    {
      image: <ItemImage src={six}/>,
      imageMobile: <ItemImageMobile src={six}/>,
      header: "Slow down",
      description: "Sabotages your opponents by slowing down their games."
    },
    {
      image: <ItemImage src={seven}/>,
      imageMobile: <ItemImageMobile src={seven}/>,
      header: "End an opponent",
      description: "Sabotage one opponent by taking away their entire score."
    },
    {
      image: <ItemImage src={eight}/>,
      imageMobile: <ItemImageMobile src={eight}/>,
      header: "Nuke",
      description: "Sabotage the entire game by taking away everyones score!"
    },
  ]

  if(getReady) {
    return (
      <GameWrapper>
          <MobileNav>
            <TopLeftLogo />
            <TopRightPoints username={username} points={points} color={selectableColors[color]}/>
          </MobileNav>
          <Text>Get ready!</Text>
          <MobileSpinner/>
      </GameWrapper>);
  }

  
  return(
    <GameWrapper>
      <MobileNav>
        <TopLeftLogo />
        <TopRightPoints username={username} points={points} color={selectableColors[color]}/>
      </MobileNav>
        <UpgradeContainer>
          <PowerUp onClick={purchaseFifityFifty}>
            <Top>
              <UpgradeImage src={one}/>
              <TextInfo>
                <Title>Remove false answers</Title>
                <Description>Removes at least two false alternatives.</Description>
              </TextInfo>
            </Top>
            
            
            { fif ?
              <Has>Unlocked</Has>
              : 
              <Price>250</Price>
            }
            
          </PowerUp>
          <PowerUp onClick={purchaseStopTime}>
            <Top>
          <UpgradeImage src={two}/>
            <TextInfo>
            <Title>Full point score</Title>
            <Description>Get full score when choosing the correct alternative, like the clock was back to start.</Description>
            
            </TextInfo>
            </Top>
            { stop ?
              <Has>Unlocked</Has>
              : 
              <Price>200</Price>
            }
            
          </PowerUp>
        </UpgradeContainer>
    </GameWrapper>
  );
    
}

export const getQuote = () => {
  return quotes[Number((Math.random() * 3).toFixed(0))];
}

const Top = styled.div`
  
display: flex;
`;

const TextInfo = styled.div`
  display: block;
`;

export const UpgradeImage = styled.img`
    display: block;
    padding-bottom: 5px;
    height: 80px;
    padding-right: 10px;
`;

const UpgradeContainer = styled.div`
  margin: 10px;

`;

const PowerUp = styled.div`
  height: 100%;
  background: #ffffff;
  border-radius: 20px;
  padding: 10px;
  color: black;
  
  line-height: 1;
  overflow: hidden;
  
  font-family: "Coll";

 margin-left: auto;
 margin-right: auto;
 margin-top: 15px;
`;//white-space: nowrap;background-color: ${props => (props.color)};

export const Description = styled.div`
    color: #686868;
    font-size: 1rem;
    font-family: "Coll";
    max-width: 250px;
`;

export const Title = styled.div`
    color: black;
    font-size: 1.2rem;
    font-family: "Coll";
    padding-top: 10px;
`;

export const Price = styled.div`
 display: flex;
 margin-top: 5px;
 background: #000000;
  border-radius: 20px;
  color: white;
  padding: 5px;
  font-size: 1em;
  text-align: center;
  justify-content: center;
`;

export const Has = styled.div`
 display: flex;
 margin-top: 5px;
 background: #0aab15;
  border-radius: 20px;
  color: black;
  padding: 5px;
  font-size: 1em;
  text-align: center;
  justify-content: center;
`;

export const BuyTop = styled.div`
 display: flex;
`;

  // return a random quote
const quotes = [
  'The best is yet to come.',
  'No pressure, no diamonds.',
  'And so the adventure begins.',
  'When nothing goes right, go left.'
  // Waiting on game master
  // Buy some upgrades?
]

export const Text = styled.div`
  height: 200px;
  position: relative;
  margin: 20px;
  color: white;
  color: white;
    font-size: 3rem;
    font-family: "Coll";
    padding: 30px;
`;

export default Result;