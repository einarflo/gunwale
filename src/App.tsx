import Splash from './Splash';
import axios, { AxiosRequestConfig } from 'axios';
import { useEffect, useState } from 'react';
import Signin from './signin/signin';
import GamePin from './signin/gamepin';
import Username from './signin/username';
import PhoneGameView from './phone/game';
import TVView from './tv/selectGame';


const App = () => {

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplashScreen(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const [username, setUsername] = useState<String | undefined>();
  const [loggedInUsername, setLoggedInUsername] = useState<String | undefined>();
  const [gamePin, setGamePin] = useState<String | undefined>();
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const [TVMode, setTVMode] = useState(false);

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if username is taken
  const setUser = (username: String) => {
    setLoading(true);
    if (username && username.length > 1) {
      axios.get(`https://www.dogetek.no/api/api.php/game_players/${username}/?checkUser=true`, { mode: 'no-cors' } as AxiosRequestConfig<any>)
      .then(res => {
        if (JSON.stringify(res.data).length < 10) {
          setError(false);
          insertPlayer(username);
        }else {
          setError(true);
          setLoading(false);
        }
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
    }
  }

  // Insert player in DB and set username
  const insertPlayer = (username: String) => {
    axios.post(`https://www.dogetek.no/api/api.php/game_players/`, {
      game_id: gamePin,
      name: username,
      score: 0,
      status: "joined"
    }, { headers: { 'content-type': 'application/x-www-form-urlencoded' } })
      .then(res => {
        console.log(res);
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
      axios.get(`https://www.dogetek.no/api/api.php/game/${pin}/`, { mode: 'no-cors' } as AxiosRequestConfig<any>)
      .then(res => {
        if (JSON.stringify(res.data).length > 10) {
          // TODO: Set user id 
          setGamePin(pin);
          setError(false);
          setLoading(false);
        }else {
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
  if (showSplashScreen) {
    return <Splash />;
  }

  // TV Mode
  if (TVMode && !loggedInUsername) {
    return <Signin toGameMode={() => setTVMode(false)} setLoggedInUser={setLoggedInUsername}/>;
  }
  if (TVMode && loggedInUsername) {
    return <TVView username={loggedInUsername} logout={() => setLoggedInUsername(undefined)} />;
  }

  // Phone Mode
  if (!gamePin) {
    return <GamePin error={error} loading={loading} setPin={setPin} toCreatorMode={() => setTVMode(true)}/>;
  }
  if (!username) {
    return <Username error={error} loading={loading} setName={(user) => setUser(user || "")} />;
  }
  return <PhoneGameView username={username} gamepin={gamePin} logout={() => {
    setUsername(undefined)
    setGamePin(undefined)
  }} />;
}

export default App;
