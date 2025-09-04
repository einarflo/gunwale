import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import TopLeftLogo from './components/TopLeftLogo';
import PrimaryButton from './components/PrimaryButton';
import SecondaryButton from './components/SecondaryButton';
import logo from './images/tavl-logo.png';
import one from './images/upgrades/1.png';
import two from './images/upgrades/2.png';
import three from './images/upgrades/3.png';
import four from './images/upgrades/4.png';
import five from './images/upgrades/5.png';
import six from './images/upgrades/6.png';
import seven from './images/upgrades/7.png';
import eight from './images/upgrades/8.png';
import WhiteButton from './components/WhiteButton';

const gradient = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;


interface SiginProps {
    signIn: () => void
    playMode: () => void
}

const LandingPage = ({ signIn, playMode }: SiginProps) => {
  const [stopCarusel, setStopCarusel] = useState(false);
  const [selectedItem, setSelectedItem] = useState(0);

  const upgrades = [
    {
      image: <ItemImage src={one}/>,
      imageMobile: <ItemImageMobile src={one}/>,
      header: "Remove false answers",
      description: "Removes at least two false alternatives.",
      price: "100 points",
      premium: false
    },
    {
      image: <ItemImage src={two}/>,
      imageMobile: <ItemImageMobile src={two}/>,
      header: "Full point score",
      description: "Get full score when choosing the correct alternative, like the clock was back to start.",
      price: "100 points",
      premium: false
    },
    {
      image: <ItemImage src={three}/>,
      imageMobile: <ItemImageMobile src={three}/>,
      header: "Gear up your score",
      description: "Score multiplyer that increases the amount of points you earn per question.",
      price: "100 points",
      premium: false
    },
    {
      image: <ItemImage src={four}/>,
      imageMobile: <ItemImageMobile src={four}/>,
      header: "Eye in the sky",
      description: "See what your oppontents are answrering in real time.",
      price: "400 points",
      premium: false
    },
    {
      image: <ItemImage src={five}/>,
      imageMobile: <ItemImageMobile src={five}/>,
      header: "Shield protection",
      description: "Protects you from sabotage from other players.",
      price: "500 points",
      premium: true
    },
    {
      image: <ItemImage src={six}/>,
      imageMobile: <ItemImageMobile src={six}/>,
      header: "Slow down",
      description: "Sabotages your opponents by slowing down their games.",
      price: "1000 points",
      premium: true
    },
    {
      image: <ItemImage src={seven}/>,
      imageMobile: <ItemImageMobile src={seven}/>,
      header: "End an opponent",
      description: "Sabotage one opponent by taking away their entire score.",
      price: "2000 points",
      premium: true
    },
    {
      image: <ItemImage src={eight}/>,
      imageMobile: <ItemImageMobile src={eight}/>,
      header: "Nuke",
      description: "Sabotage the entire game by taking away everyones score!",
      price: "10 000 points",
      premium: true
    },
  ]

  

  useEffect(() => {
    const timer = setInterval(() => {
      if (!stopCarusel) {
        if (selectedItem === 7) {
          setSelectedItem(0);
        } else {
          setSelectedItem(selectedItem + 1)
        }
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [selectedItem, setSelectedItem, stopCarusel]);

  //select color - maybe 5 circles?
  // diffent power ups for each color, maybe some sort of name?

  // Should be an upgrade getting black with gold letters

  return (
    <LandingWrapper>
        <LeftSide>
        <TopLeftLogo />
          <ContentLeft>
            <Header>Upgrades</Header>
            <UpgradeItem key={selectedItem}>
              { upgrades[selectedItem].image }
              <ItemInfo>
                <ItemHeader>{ upgrades[selectedItem].header }</ItemHeader>
                <ItemDescription>{ upgrades[selectedItem].description }</ItemDescription>
              </ItemInfo>
            </UpgradeItem>
            <AllUpgrades>
              <Row>
                <SmallItemImage src={one} onClick={() => {setSelectedItem(0); setStopCarusel(true)}} selected={selectedItem === 0}/>
                <SmallItemImage src={two} onClick={() => {setSelectedItem(1); setStopCarusel(true)}} selected={selectedItem === 1}/>
                <SmallItemImage src={three} onClick={() => {setSelectedItem(2); setStopCarusel(true)}} selected={selectedItem === 2}/>
                <SmallItemImage src={four} onClick={() => {setSelectedItem(3); setStopCarusel(true)}} selected={selectedItem === 3}/>
              </Row>
              <Row>
                <SmallItemImage src={five} onClick={() => {setSelectedItem(4); setStopCarusel(true)}} selected={selectedItem === 4}/>
                <SmallItemImage src={six} onClick={() => {setSelectedItem(5); setStopCarusel(true)}} selected={selectedItem === 5}/>
                <SmallItemImage src={seven} onClick={() => {setSelectedItem(6); setStopCarusel(true)}} selected={selectedItem === 6}/>
                <SmallItemImage src={eight} onClick={() => {setSelectedItem(7); setStopCarusel(true)}} selected={selectedItem === 7}/>
              </Row>
            </AllUpgrades>

          </ContentLeft>
        </LeftSide>
        <RightSide>
          <ContentRight>
            <Logo src={logo} />
            <div style={{ paddingTop: '60px'}} />
            <PrimaryButton click={() => playMode()} text='Join a game'/>
            <div style={{ paddingTop: '20px'}} />
            <SecondaryButton click={() => signIn()} text='Sign in'/>
            <div style={{ paddingTop: '80px'}} />
          </ContentRight>
        </RightSide>
        <Mobile>
          <MobileNav>
            <TopLeftLogo />
            <JoinGame>
              <PrimaryButton text='Join game' click={() => playMode()}/>
            </JoinGame>
          </MobileNav>
          <BlueWrapper>
              <MobileHeader>Theres a new quiz in town. <br/>Free.</MobileHeader>
              <SignInContainer>
                <WhiteButton text='Sign in or sign up' click={() => signIn()} />
              </SignInContainer>
            </BlueWrapper>
            <HeaderMobile>Upgrades</HeaderMobile>
            <UpgradeItemMobile key={selectedItem}>
              { upgrades[selectedItem].imageMobile }
              <ItemInfoMobile>
                <ItemHeaderMobile>{ upgrades[selectedItem].header }</ItemHeaderMobile>
                <ItemDescriptionMobile>{ upgrades[selectedItem].description }</ItemDescriptionMobile>
              </ItemInfoMobile>
            </UpgradeItemMobile>
            <AllUpgradesMobile>
                <SmallItemImageMobile src={one} onClick={() => {setSelectedItem(0); setStopCarusel(true)}} selected={selectedItem === 0}/>
                <SmallItemImageMobile src={two} onClick={() => {setSelectedItem(1); setStopCarusel(true)}} selected={selectedItem === 1}/>
                <SmallItemImageMobile src={three} onClick={() => {setSelectedItem(2); setStopCarusel(true)}} selected={selectedItem === 2}/>
                <SmallItemImageMobile src={four} onClick={() => {setSelectedItem(3); setStopCarusel(true)}} selected={selectedItem === 3}/>
                <SmallItemImageMobile src={five} onClick={() => {setSelectedItem(4); setStopCarusel(true)}} selected={selectedItem === 4}/>
                <SmallItemImageMobile src={six} onClick={() => {setSelectedItem(5); setStopCarusel(true)}} selected={selectedItem === 5}/>
                <SmallItemImageMobile src={seven} onClick={() => {setSelectedItem(6); setStopCarusel(true)}} selected={selectedItem === 6}/>
                <SmallItemImageMobile src={eight} onClick={() => {setSelectedItem(7); setStopCarusel(true)}} selected={selectedItem === 7}/>
            </AllUpgradesMobile>
            <HeaderMobile>Featured quizzes</HeaderMobile>
        </Mobile>
    </LandingWrapper>
  );
}

export const HeaderMobile = styled.div`
    color: #9F9F9F;
    font-size: 1.2rem;
    font-family: "Coll";
    padding: 30px;
    padding-bottom: 20px;
    padding-top: 20px;
`;

export const SmallItemImageMobile = styled.img.attrs((props: {selected: boolean}) => props)`
    display: block;
    
    margin-bottom: 10px;
    height: 50px;
    margin-right: 10px;
    cursor: pointer;

    opacity: ${props => props.selected ? '100%' : '70%'};
`;

export const AllUpgradesMobile = styled.div`
    display: flex;
    margin-left: 30px;
    margin-right: 30px;
    flex-wrap: wrap;
`;


export const ItemInfoMobile = styled.div`
    display: block;
`;

export const ItemDescriptionMobile = styled.div`
    color: #686868;
    font-size: 1rem;
    font-family: "Coll";
    max-width: 250px;
`;

export const ItemHeaderMobile = styled.div`
    color: black;
    font-size: 1.2rem;
    font-family: "Coll";
    padding-top: 10px;
`;

export const ItemImageMobile = styled.img`
    display: block;
    padding-bottom: 15px;
    height: 100px;
    padding-right: 10px;
`;




const SignInContainer = styled.div`
 display: flex;
 justify-content: center;
 padding-bottom: 25px;
`;

export const MobileNav = styled.div`
    display: flex;
    height: 85px;
    width: 100%;
    background: white;
`;

export const MobileHeader = styled.div`
    color: white;
    font-size: 3rem;
    font-family: "Coll";
    padding: 30px;
`;

const BlueWrapper = styled.div`
  background: linear-gradient(135deg, #6A71FA 0%, #9C8AFA 50%, #6A71FA 100%);
  background-size: 200% 200%;
  animation: ${gradient} 10s ease infinite;
  width: 100%;
`;

const JoinGame = styled.div`
  position: absolute;
  right: 0;
  padding-top: 20px;
  padding-right: 40px;
`;

const Mobile = styled.div`
display: block;
width: 100vw;
  @media (min-width: 1161px) {
    display: none;
  }
`;

export const SmallItemImage = styled.img.attrs((props: {selected: boolean}) => props)`
    display: block;
    
    margin-bottom: 15px;
    height: 90px;
    margin-right: 15px;
    cursor: pointer;

    #border-radius: 27px;
    #border: 5px solid #6A71FA;
    opacity: ${props => props.selected ? '100%' : '70%'};
`;

export const AllUpgrades = styled.div`
    display: block;
    margin-left: auto;
    margin-right: auto;
    padding-top: 80px;
`;

export const Row = styled.div`
    display: flex;
    justify-content: center;
`;

export const ItemInfo = styled.div`
    display: block;
`;

export const ItemDescription = styled.div`
    color: #686868;
    font-size: 1.2rem;
    font-family: "Coll";
    width: 400px;
`;

export const ItemHeader = styled.div`
    color: black;
    font-size: 2rem;
    font-family: "Coll";
`;

export const ItemImage = styled.img`
    display: block;
    margin-left: auto;
    margin-right: auto;
    padding-bottom: 40px;
    height: 100px;
    padding-right: 20px;
`;

const pulse = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 100%;
  }
`;


const UpgradeItemMobile = styled.div`
    display: flex;
    padding-left: 30px;
    padding-right: 30px;
    animation: ${pulse} 0.5s ease-in;
    `;

const UpgradeItem = styled.div`
    display: flex;
    justify-content: center;
    width: 100;
    animation: ${pulse} 0.5s ease-in;
`;

const Header = styled.div`
    color: #9F9F9F;
    font-size: 1.5rem;
    font-family: "Coll";
    padding-bottom: 20px;
`;

const LandingWrapper = styled.div`
    height: 100vh;
    height: 100dvh;
    width: 100vw;
    background: #ffffff;
    display: flex;
`;

export const Logo = styled.img`
    display: block;
    margin-left: auto;
    margin-right: auto;
    padding-bottom: 40px;
    height: 150px;
`;

const ContentLeft = styled.div`
    position: absolute;
    top: 50%;
    left: 25%;
    transform: translate(-50%, -50%);
    min-width: 300px;
    max-width: 80vw;
    animation: ${fadeUp} 1s ease forwards;
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
    animation: ${fadeUp} 1s ease forwards;
    @media (max-width: 1160px) {
      display: none;
      left: 50%;
    }
`;

const LeftSide = styled.div`
  width: 50%;
  @media (max-width: 1160px) {
    display: none;
    width: 100;
  }
  
`;

const RightSide = styled.div`
  width: 50%;
  background: linear-gradient(135deg, #6A71FA 0%, #9C8AFA 50%, #6A71FA 100%);
  background-size: 200% 200%;
  animation: ${gradient} 10s ease infinite;
  @media (max-width: 1160px) {
    display: none;
    width: 100;
  }
`;

export default LandingPage;