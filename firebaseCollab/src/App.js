import React, { useEffect, useState } from "react";
import { loginUrl, getTokenFromUrlFrontend } from "./utils/SpotifyAuth"; // Import the login URL and helper function
import SpotifyWebApi from "spotify-web-api-js";
import PartyCodeScreen from "./components/PartyCodeScreen";
import SearchBarScreen from "./components/SearchBarScreen";
import VoteScreen from "./components/VoteScreen";
import DJLogin from "./components/DJLogin"; // Import the DJLogin component
import DJStats from "./components/DJStats";
import StatsScreen from "./components/StatsScreen";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Initialize Spotify Web API instance
const spotifyApi = new SpotifyWebApi();

const App = () => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const { access_token } = getTokenFromUrlFrontend();

    if (access_token) {
      // If we get the token from the URL, set it in the state
      setToken(access_token);
      spotifyApi.setAccessToken(access_token);

      // Store the token in localStorage
      localStorage.setItem("spotify_access_token", access_token);

      // Clean up the URL by removing the access_token (so the user won't see it anymore)
      window.history.pushState({}, null, "/");
    } else {
      // If token is not in URL, check localStorage for a saved token
      const savedToken = localStorage.getItem("spotify_access_token");
      if (savedToken) {
        setToken(savedToken);
        spotifyApi.setAccessToken(savedToken);
      } else {
        // No token, navigate to login screen
        window.location.href = loginUrl;
      }
    }
  }, []);

  // Run Spotify API call to verify token (optional)
  useEffect(() => {
    if (token) {
      spotifyApi.getMe().then(
        (user) => {
          console.log("Logged in as:", user);
        },
        (err) => {
          console.error("Error with token:", err);
          // If the token is invalid, clear it and redirect to login
          localStorage.removeItem("spotify_access_token");
          setToken(null);  // Clear token from state
          window.location.href = loginUrl;  // Redirect to login
        }
      );
    }
  }, [token]);

  // Render the app once token is set
  return token ? (
    <Router>
      <Routes>
        <Route path="/" element={<PartyCodeScreen />} />
        <Route path="/search" element={<SearchBarScreen spotifyApi={spotifyApi} />} />
        <Route path="/vote" element={<VoteScreen />} />
        <Route path="/stats" element={<StatsScreen />} />
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
