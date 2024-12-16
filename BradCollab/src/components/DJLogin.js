import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate instead of useHistory

const DJLogin = () => {
  const [roomCode, setRoomCode] = useState('');
  const navigate = useNavigate(); // Use useNavigate hook

  const handleLogin = () => {
    if (roomCode) {
      // Navigate to DJ Stats page with the room code
      navigate(`/dj-stats/${roomCode}`);
    } else {
      alert("Please enter a valid room code");
    }
  };

  return (
    <div>
      <h1>DJ Login</h1>
      <input
        type="text"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
        placeholder="Enter Room Code"
      />
      <button onClick={handleLogin}>Login as DJ</button>
    </div>
  );
};

export default DJLogin;
