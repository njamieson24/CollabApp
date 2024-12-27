import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchRoomDetailsFromFirestore, addUserToRoom, createPartyRoom } from '../firebase'; // Import necessary Firebase functions

const PartyCodeScreen = () => {
  const [roomCode, setRoomCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isRoomValid, setIsRoomValid] = useState(false); // To track if the room code is valid
  const [generatedRoomCode, setGeneratedRoomCode] = useState('');
  const navigate = useNavigate();

  // Handle room code validation
  const validateRoomCode = async () => {
    if (roomCode.length === 6) {
      try {
        const roomDetails = await fetchRoomDetailsFromFirestore(roomCode);
        console.log("room Details", roomDetails);
        if (roomDetails) {
          setIsRoomValid(true);
          setErrorMessage('');
        } else {
          setErrorMessage('Invalid room code! Please try again.');
        }
      } catch (error) {
        console.error('Error validating room code:', error);
        setErrorMessage('An error occurred. Please try again.');
      }
    } else {
      setErrorMessage('Please enter a valid 6-digit room code!');
    }
  };



  const generateRoomCode = async () => {
    try {
      const newRoomCode = await createPartyRoom(); // Call the Firebase function
      setGeneratedRoomCode(newRoomCode); // Update state with the generated room code
      setRoomCode(newRoomCode); // Set the input field with the generated code for validation
    } catch (error) {
      console.error('Error generating room code:', error);
      setErrorMessage('An error occurred while generating a room code. Please try again.');
    }
  };


  // Handle adding user to room and logging in
  const handleLogin = async () => {
    const trimmedName = displayName.trim(); // Trim the displayName
    if (!trimmedName) {
      setErrorMessage('Please enter a display name!');
      return;
    }

    try {
      const success = await addUserToRoom(roomCode, trimmedName); // Pass trimmed displayName

      if (success) {
        localStorage.setItem('roomCode', roomCode);
        localStorage.setItem('displayName', trimmedName);
        navigate('/search'); // Navigate to Search page
      } else {
        setErrorMessage('Display name already exists in this room. Please choose another.');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setErrorMessage('An error occurred while logging in. Please try again.');
    }
  };

  return (
    <div className="party-code-screen">
      <h1>Welcome to the Party</h1>
      {!isRoomValid ? (
        <>
          <p>Please enter a room code to continue:</p>
          <input
            type="text"
            maxLength="6"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            placeholder="6-digit room code"
          />
          <button onClick={validateRoomCode}>Validate Room</button>
          <button onClick={generateRoomCode}>Generate Random Room Code</button>
          {generatedRoomCode && (
            <p style={{ color: 'green' }}>Generated Room Code: {generatedRoomCode}</p>
          )}
        </>
      ) : (
        <>
          <p>Room validated! Please enter your display name:</p>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)} // Update displayName state
            placeholder="Enter display name"
          />
          <button onClick={handleLogin}>Login</button>
        </>
      )}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
};

export default PartyCodeScreen;
