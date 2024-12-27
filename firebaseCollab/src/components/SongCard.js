import React from "react";
import { addSongToFirestore } from '../firebase';  // Import the function to add songs

const SongCard = ({ song, roomCode }) => {
  // Destructure song properties
  const { name, uri, album, artists } = song;

  const handleAddSong = async () => {
    console.log("Add song button clicked");

    try {
      if (!roomCode) {
        alert("Please join or create a party first!");
        return;
      }

      // Extract album cover image URL
      const songImage = album.images[0]?.url;  // Get the first image in the album

      // Call the function to add the song to Firestore with the album image
      await addSongToFirestore(roomCode, name, uri, artists[0]?.name, songImage);

      console.log("Song added successfully.");

      // Make sure artists[0]?.name is defined before using it
      const artistName = artists[0]?.name || "Unknown Artist";  // Default value if no artist name
      alert(`${name} by ${artistName} added to the party!`);

    } catch (error) {
      console.error("Error adding song:", error);
      alert("Error adding song. Please check the console for more details.");
    }
  };

  return (
    <div className="song-card">
      <img src={song.album.images[0]?.url} alt={song.name} />
      <div>
        <h3>{song.name}</h3>
        <p>by {song.artists.map((artist) => artist.name).join(", ")}</p>
      </div>
      <button onClick={handleAddSong}>Add</button>
    </div>
  );
};

export default SongCard;

/*import React from "react";
import { addSongToFirestore } from '../firebase';  // Import the function to add songs

const SongCard = ({ song, roomCode }) => {
  // Destructure song properties
  const { name, uri, album, artists } = song;

  const handleAddSong = async () => {
    console.log("Add song button clicked");  // Add this line

    try {
      if (!roomCode) {
        alert("Please join or create a party first!");
        return;
      }
  
      // Call the function to add the song to Firestore
      await addSongToFirestore(roomCode, name, uri, artists[0]?.name);
  
      console.log("Song added successfully.");
      
      // Make sure artists[0]?.name is defined before using it
      const artistName = artists[0]?.name || "Unknown Artist";  // Default value if no artist name
      alert(`${name} by ${artistName} added to the party!`);
      
    } catch (error) {
      console.error("Error adding song:", error);
      alert("Error adding song. Please check the console for more details.");
    }
  };

  return (
    <div className="song-card">
      <img src={song.album.images[0]?.url} alt={song.name} />
      <div>
        <h3>{song.name}</h3>
        <p>by {song.artists.map((artist) => artist.name).join(", ")}</p>
      </div>
      <button onClick={handleAddSong}>Add</button>
    </div>
  );
};

export default SongCard;
*/