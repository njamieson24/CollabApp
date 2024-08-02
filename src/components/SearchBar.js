import React, { useState, useEffect, useContext } from 'react';
import { fetchSearchResults, refreshAccessToken } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { PlaylistContext } from '../contexts/PlaylistContext';
import './SearchBar.css';

import hamburgerGray from '../img/hamburgerGray.png';
import exitGray from '../img/exitGray.png';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const { playlist, setPlaylist } = useContext(PlaylistContext);
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem('spotify_access_token');
    if (!accessToken) {
      refreshAccessToken();
    }
  }, []);

  const handleSearch = async () => {
    let accessToken = localStorage.getItem('spotify_access_token');

    if (!accessToken) {
      setError('No access token found. Please log in.');
      return;
    }

    try {
      const data = await fetchSearchResults(query, accessToken);
      if (!data) {
        accessToken = await refreshAccessToken();
        if (!accessToken) {
          setError('Failed to refresh access token. Please log in again.');
          return;
        }

        const retryData = await fetchSearchResults(query, accessToken);
        if (retryData) {
          setResults(retryData.tracks.items);
          setError('');
        } else {
          setError('Error fetching search results.');
        }
      } else {
        setResults(data.tracks.items);
        setError('');
      }
    } catch (error) {
      setError('Error fetching search results. Please try again later.');
    }
  };

  const handleAddToPlaylist = (track) => {
    setPlaylist((prevPlaylist) => {
      if (prevPlaylist.some(song => song.id === track.id)) {
        return prevPlaylist.filter((song) => song.id !== track.id);
      } else {
        return [...prevPlaylist, track];
      }
    });
  };

  const handleViewPlaylist = () => {
    navigate('/playlist');
  };

  const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  return (
    <div className="search-container">
      <div className="search-bar">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a song"
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      {error && <p>{error}</p>}
      <div>
        {results.map((track) => (
          <div key={track.id} className="search-result-container">
            <img src={track.album.images[0]?.url} alt={track.name} />
            <div className="text-container">
              <p className="track-name">{truncateText(track.name, 25)}</p>
              <p className="artist-name">{truncateText(track.artists.map(artist => artist.name).join(', '), 21)}</p>
            </div>
            <button
              className={`add-button ${playlist.some(song => song.id === track.id) ? 'active' : ''}`}
              onClick={() => handleAddToPlaylist(track)}
            >
              +
            </button>
          </div>
        ))}
      </div>

      {/* Navbar */}
      <div className="navbar">
        <div className="navbar-item">
          <img src={hamburgerGray} alt="Hamburger Menu" onClick={handleViewPlaylist} />
          <p>Queue</p>
        </div>
        <div className="navbar-item middle">
          <button className="request-button" onClick={() => navigate('/')}>
            +
          </button>
          <p>Request</p>
        </div>
        <div className="navbar-item">
          <img src={exitGray} alt="Exit Icon" />
          <p>Leave</p>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
