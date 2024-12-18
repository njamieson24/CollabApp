import React from "react";

const SongCard = ({ song }) => {
  const handleAddToParty = async () => {
  // Retrieve the roomCode (partyCode) from localStorage
  const roomCode = localStorage.getItem("partyCode");

  if (!roomCode) {
    alert("Please join or create a party first!");
    return;
  }

  try {
    // Send a POST request to the backend to add the song to the party
    const response = await fetch("http://localhost:5000/add-song", {
      method: "POST", // HTTP method
      headers: {
        "Content-Type": "application/json", // The content type being sent to the server
      },
      body: JSON.stringify({
        roomCode: roomCode,  // The room code from localStorage
        songName: song.name, // The song's name
        songUrl: song.uri,   // The song's URL
      }),
    });

    if (response.ok) {
      // If the request is successful, notify the user
      alert(`${song.name} by ${song.artists[0].name} added to the party!`);
    } else {
      // If the request fails, notify the user
      alert("Error adding song to party.");
    }
  } catch (error) {
    // If there's an error with the fetch request, catch it and notify the user
    alert("Error adding song to party.");
    console.error("Error:", error);
  }
};



  return (
    <div className="song-card">
      <img src={song.album.images[0]?.url} alt={song.name} />
      <div>
        <h3>{song.name}</h3>
        <p>by {song.artists.map((artist) => artist.name).join(", ")}</p>
      </div>
      <button onClick={handleAddToParty}>Add</button>
    </div>
  );
};

export default SongCard;
