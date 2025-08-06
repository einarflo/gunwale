import Splash from './Splash';
import axios, { AxiosRequestConfig } from 'axios';
import { useEffect, useState } from 'react';
import Signin from './signin/signin';
import GamePin from './signin/gamepin';
import Username from './signin/username';
import PhoneGameView from './phone/game';
import TVView from './tv/selectGame';
import LandingPage from './landing';
import { UserContext } from './UserContext';

const appHeight = () => {
  const doc = document.documentElement
  doc.style.setProperty(' — app-height', `${window.innerHeight}px`)
 }
 window.addEventListener('resize', appHeight)
 appHeight()


const App = () => {

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplashScreen(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if(pair[0] === 'gameid'){
            setShowLandingPage(false)
            setGamePin(pair[1])
        }
    }
}, [])

  const [username, setUsername] = useState<String | undefined>();
  const [userId, setUserId] = useState<String | undefined>();
  const [loggedInUsername, setLoggedInUsername] = useState<String | undefined>();
  const [gamePin, setGamePin] = useState<String | undefined>();
  const [gameId, setGameId] = useState<String | undefined>();
  const [gameInstanceId, setGameInstanceId] = useState<String | undefined>();
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [TVMode, setTVMode] = useState(false);

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if username is taken
  const setUser = (username: String, gamePin: String) => {
    setLoading(true);
    if (username && username.length > 1) {
      axios.get(`https://www.dogetek.no/api/api.php/game_instance_players/${gamePin}/?checkUser=true`, { mode: 'no-cors' } as AxiosRequestConfig<any>)
      .then(res => {
        console.log(res);

        if (res.data) {
          if (res.data.find((player: GameInstancePlayer) => player.username == username)){
            setError(true);
            setLoading(false);
          } else {
            setError(false);
            insertPlayer(username);
          }     
        }
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
    }
    else {
      setError(true);
      setLoading(false);
    }
  }

  // Insert player in DB and set username
  const insertPlayer = (username: String) => {
    axios.post(`https://www.dogetek.no/api/api.php/game_instance_players/`, {
      game_id: gameId,
      game_instance_id: gameInstanceId,
      username: username,
      score: "0",
    }, { headers: { 'content-type': 'application/x-www-form-urlencoded' } })
      .then(res => {
        console.log(res);
        setUserId(res.data);
        setUsername(username);
        setLoading(false);
        // Get new posts
      })
      .catch(err => {
        console.log("Something fishy is going on");
        setLoading(false);
      });
  }

  // Set the game pin if it exists
  const setPin = (pin: String | undefined) => {
    if (pin && pin.length > 0 && pin !== "0") {
      setLoading(true);
      axios.get(`https://www.dogetek.no/api/api.php/game_instance/${pin}/`, { mode: 'no-cors' } as AxiosRequestConfig<any>)
      .then(res => {
        console.log('status: ', res.data["status"])
        if (res.data && (res.data["status"] === "created")) {
          setGameId(res.data["game_id"]);
          setGameInstanceId(res.data["id"]);
          setGamePin(pin);
          setError(false);
          setLoading(false);
        } else {
          setError(true);
          setLoading(false);
        }
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
    }
    else {
      setError(true);
    }
  }


  // Just the splash screen
  if (showSplashScreen && false) {
    return <Splash />;
  }

  if (showLandingPage) {
    return <LandingPage toGameMode={() => {setTVMode(true); setShowLandingPage(false)}} toEditMode={() => {setShowLandingPage(false)}} />;
  }

  // TV Mode
  if (TVMode && !loggedInUsername) {
    return <Signin toGameMode={() => setTVMode(false)} setLoggedInUser={setLoggedInUsername}/>;
  }
  if (TVMode && loggedInUsername) {
    return <TVView username={loggedInUsername} logout={() => setLoggedInUsername(undefined)} />;
  }

  // Phone Mode
  if (!gameId || !gameInstanceId || !gamePin) {
    return <GamePin error={error} loading={loading} setPin={setPin} toCreatorMode={() => setTVMode(true)}/>;
  }
  if (!username || !userId) {
    return <Username error={error} loading={loading} setName={(user) => setUser(user || "", gameId)} />;
  }
  return (
    <UserContext.Provider value={{ username: username as string | undefined, userId: userId as string | undefined, setUsername: setUsername as (name?: string) => void, setUserId: setUserId as (id?: string) => void }}>
      <PhoneGameView gameId={gameId} gamePin={gamePin} gameInstanceId={gameInstanceId} logout={() => {
        setUsername(undefined);
        setGamePin(undefined);
      }} />
    </UserContext.Provider>
  );
}

export default App;


export interface GameInstancePlayer {
  id: String;
  game_id: String;
  game_instance_id: String;
  username: String;
  score: String;
  colour: String;
  lottery: String;
  spending: String;
}