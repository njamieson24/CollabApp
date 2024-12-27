import React, { useEffect, useState } from "react";
import { loginUrl } from "./utils/SpotifyAuth"; // Import the login URL
import SpotifyWebApi from "spotify-web-api-js";
import PartyCodeScreen from "./components/PartyCodeScreen";
import SearchBarScreen from "./components/SearchBarScreen";
import VoteScreen from "./components/VoteScreen";
import DJLogin from "./components/DJLogin"; // Import the DJLogin component
import DJStats from "./components/DJStats";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Initialize Spotify Web API instance
const spotifyApi = new SpotifyWebApi();

const App = () => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("access_token");
  
    // Check if the access token is still valid (e.g., by checking expiration time)
    if (accessToken) {
      setToken(accessToken);
      spotifyApi.setAccessToken(accessToken);
      localStorage.setItem("spotify_access_token", accessToken);
    } else if (localStorage.getItem("spotify_access_token")) {
      setToken(localStorage.getItem("spotify_access_token"));
      spotifyApi.setAccessToken(localStorage.getItem("spotify_access_token"));
    } else {
      // No token found, navigate to login screen or show login prompt
      window.location.href = loginUrl;
    }
  
    window.history.pushState({}, null, "/");
  }, []);
  
   // Run only once when component is mounted

  // Render the app once token is set
  return token ? (
    <Router>
      <Routes>
        <Route path="/" element={<PartyCodeScreen />} />
        <Route path="/search" element={<SearchBarScreen spotifyApi={spotifyApi} />} />
        <Route path="/vote" element={<VoteScreen />} />
        <Route path="/dj-login" element={<DJLogin />} /> {/* DJ Login route */}
        <Route path="/dj-stats/:roomCode" element={<DJStats />} /> {/* DJ Stats route with room code */}
      </Routes>
    </Router>
  ) : (
    <div>
      <p>To continue, please log in with Spotify:</p>
      <a href={loginUrl}>
        <button>Login to Spotify</button>
      </a>
    </div>
  );
};

export default App;
