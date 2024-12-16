import React, { useState, useEffect } from "react";
import NavBar from "./NavBar";

const VoteScreen = () => {
  const [partySongs, setPartySongs] = useState([]);
  const [userVotes, setUserVotes] = useState({}); // Store user votes here
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPartySongs = async () => {
      const partyCode = localStorage.getItem("partyCode");
  
      if (!partyCode) {
        setError("Room code is missing");
        setLoading(false);
        return;
      }
  
      try {
        const response = await fetch(`http://localhost:5000/party-songs/${partyCode}`);
        if (response.ok) {
          const data = await response.json();
  
          console.log("Fetched party songs:", data); // Log the response
  
          if (data.length > 0) {
            setPartySongs(data);
  
            // Initialize user votes from existing data if any
            const initialVotes = data.reduce((acc, song) => {
              acc[song.id] = song.user_vote || null; // user_vote is null if no vote
              return acc;
            }, {});
            setUserVotes(initialVotes);
          } else {
            setError("No songs found for this party.");
          }
        } else {
          setError("Error fetching songs");
        }
      } catch (error) {
        setError("Error fetching songs");
        console.error("Error fetching party songs:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchPartySongs();
  }, []);
  

  const handleVote = async (songId, voteType) => {
    const partyCode = localStorage.getItem("partyCode");

    if (!partyCode) {
      alert("Please join or create a party first!");
      return;
    }

    // Check if the user already voted on the song and if it's the same vote
    if (userVotes[songId] === voteType) {
      alert("You already voted for this song.");
      return;
    }

    // Send the vote to the server
    try {
      const response = await fetch("http://localhost:5000/vote-song", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          partyCode: partyCode,
          songId: songId,
          voteType: voteType,
        }),
      });

      if (response.ok) {
        alert(`${voteType === "up" ? "Upvoted" : "Downvoted"} the song!`);

        // Update the local state with the user's vote
        setUserVotes((prevVotes) => ({
          ...prevVotes,
          [songId]: voteType,
        }));

        // Re-fetch songs to update the votes
        const updatedResponse = await fetch(`http://localhost:5000/party-songs/${partyCode}`);
        const updatedData = await updatedResponse.json();
        setPartySongs(updatedData);
      } else {
        alert("Error voting for the song.");
      }
    } catch (error) {
      alert("Error voting for the song.");
      console.error("Error:", error);
    }
  };

  // Handle loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Handle error state
  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="vote-screen">
      <h1>Vote for Songs</h1>
      {partySongs && partySongs.length > 0 ? (
        partySongs.map((song) => (
          <div key={song.id} className="vote-card">
            <h3>{song.song_name}</h3>
            <div>
              <button
                onClick={() => handleVote(song.id, "up")}
                disabled={userVotes[song.id] === "up"}
              >
                ⬆️ Upvote
              </button>
              <button
                onClick={() => handleVote(song.id, "down")}
                disabled={userVotes[song.id] === "down"}
              >
                ⬇️ Downvote
              </button>
            </div>
            <div>
              {song.likes} Likes | {song.dislikes} Dislikes
            </div>
          </div>
        ))
      ) : (
        <p>No songs to vote on.</p>
      )}
      <NavBar />
    </div>
  );
};

export default VoteScreen;
