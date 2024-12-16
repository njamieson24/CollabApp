import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PartyCodeScreen = () => {
  const [partyCode, setPartyCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [newRoomCode, setNewRoomCode] = useState('');
  const navigate = useNavigate();

  // Handle joining an existing party
  const handleJoinParty = async () => {
    if (partyCode.length === 4) {
      try {
        const response = await fetch(`http://localhost:5000/join-party/${partyCode}`);
        
        // Check if the response is OK
        if (response.ok) {
          const data = await response.json();
          console.log("Join party response:", data);
  
          if (data.exists) {
            // If the room exists, navigate to the search page
            localStorage.setItem('partyCode', partyCode);
            navigate('/search');
          } else {
            setErrorMessage('Invalid party code! Please try again.');
          }
        } else {
          setErrorMessage('Error joining the party. Please try again.');
        }
      } catch (error) {
        console.error("Error joining the party:", error);
        setErrorMessage('Error joining the party. Please try again.');
      }
    } else {
      setErrorMessage('Please enter a 4-digit party code!');
    }
  };
  

  // Handle creating a new party room
  const handleCreateParty = async () => {
    try {
      const response = await fetch('http://localhost:5000/create-party', {
        method: 'POST',
      });
  
      // Log the entire response to check its content
      const responseData = await response.json();
      console.log('Full Response:', responseData);
  
      if (response.ok) {
        setNewRoomCode(responseData.roomCode); // Set room code
        console.log('Room Code received:', responseData.roomCode);
      } else {
        setErrorMessage('Error creating party room. Please try again.');
      }
    } catch (error) {
      console.error('Error creating party room:', error);
      setErrorMessage('Error creating party room. Please try again.');
    }
  };

  // Handle DJ Login
  const handleDJLogin = () => {
    navigate('/dj-login'); // Navigates to the DJLogin page
  };

  return (
    <div className="party-code-screen">
      <h1>Enter Party Code</h1>
      <input
        type="text"
        maxLength="4"  // Adjusted to accept only 4 digits
        value={partyCode}
        onChange={(e) => setPartyCode(e.target.value)}
        placeholder="4-digit code"
      />
      <button onClick={handleJoinParty}>Join Party</button>

      <button onClick={handleCreateParty}>Create Room</button>

      <button onClick={handleDJLogin}>DJ Login</button> {/* New DJ Login button */}

      {newRoomCode && (
        <div>
          <h2>Your Room Code is: {newRoomCode}</h2>
          <p>Use this code to join the party!</p>
        </div>
      )}

      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
};

export default PartyCodeScreen;
