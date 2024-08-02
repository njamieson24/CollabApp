import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import { PlaylistContext } from '../contexts/PlaylistContext'; // Import PlaylistContext
import './SearchBar.css';
import './Playlist.css';

import hamburgerGray from '../img/hamburgerGray.png';
import exitGray from '../img/exitGray.png';

const Playlist = () => {
  const { playlist, setPlaylist } = useContext(PlaylistContext); // Use context for playlist
  const navigate = useNavigate(); // Initialize navigate

  const removeFromPlaylist = (trackId) => {
    // Filter out the track to remove it from the playlist
    const updatedPlaylist = playlist.filter((song) => song.id !== trackId);
    // Update the context with the new playlist
    setPlaylist(updatedPlaylist);
  };

  const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  const handleBackToSearch = () => {
    navigate('/'); // Navigate back to the search bar
  };

  return (
    <div className="playlist-container">
      <h1 className="playlist-title">Playlist</h1>
      <div>
        {playlist.map((track) => (
          <div key={track.id} className="search-result-container">
            <img src={track.album.images[0]?.url} alt={track.name} />
            <div className="text-container">
              <p className="track-name">{truncateText(track.name, 25)}</p>
              <p className="artist-name">{truncateText(track.artists.map(artist => artist.name).join(', '), 21)}</p>
            </div>
            <button
              className="remove-button"
              onClick={() => removeFromPlaylist(track.id)}
            >
              X
            </button>
          </div>
        ))}
      </div>

      {/* Navbar */}
      <div className="navbar">
        <div className="navbar-item">
          <img src={hamburgerGray} alt="Hamburger Menu" />
          <p>Queue</p>
        </div>
        <div className="navbar-item middle">
          <button className="request-button" onClick={handleBackToSearch}>
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

export default Playlist;
