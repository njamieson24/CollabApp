import React, { useState } from "react";
import SongCard from "./SongCard";
import NavBar from "./NavBar";

const SearchBarScreen = ({ spotifyApi }) => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const roomCode = localStorage.getItem("roomCode");
  
  const handleSearch = async () => {
    if (!query) return;

    try {
      const response = await spotifyApi.searchTracks(query);
      setSearchResults(response.tracks.items);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  return (
    <div className="search-bar-screen">
      <h1>Search for Songs</h1>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a song or artist..."
      />
      <button onClick={handleSearch}>Search</button>
      <div className="song-list">
        {searchResults.map((song) => (
          <SongCard key={song.id} song={song} roomCode={roomCode} />
        ))}
      </div>
      <NavBar />
    </div>
  );
};

export default SearchBarScreen;
