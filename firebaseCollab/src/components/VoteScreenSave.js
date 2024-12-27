import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { firestore } from "../firebase"; // Firestore reference
import NavBar from "./NavBar";

const VoteScreen = () => {
  const [partySongs, setPartySongs] = useState([]);
  const [userVotes, setUserVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch songs from the Firestore database
  /*const fetchPartySongs = async () => {
    const partyCode = localStorage.getItem("roomCode");
    console.log("Party Code:", partyCode);

    if (!partyCode) {
      setError("Room code is missing");
      setLoading(false);
      return;
    }

    try {
      const songsRef = collection(firestore, "songs");
      const q = query(songsRef, where("room_code", "==", partyCode));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.log("Query Results:", querySnapshot.docs.map((doc) => doc.data()));
        const songs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPartySongs(songs);

        // Retrieve user votes from Firestore (assuming they are stored under "votes" collection)
        const username = localStorage.getItem("displayName");
        const roomCode = localStorage.getItem("roomCode");
        if (username && roomCode) {
          const voteDocId = `${username}_${roomCode}`;
          const voteRef = doc(firestore, "votes", voteDocId);
          const docSnap = await getDoc(voteRef);
          
          if (docSnap.exists()) {
            const voteData = docSnap.data();
            setUserVotes(voteData.songs || []);
          }
        }
      } else {
        setError("No songs found for this room.");
      }
    } catch (err) {
      setError("Error fetching songs.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };*/

  const fetchPartySongs = async () => {
    const partyCode = localStorage.getItem("roomCode");
    console.log("Party Code:", partyCode);
  
    if (!partyCode) {
      setError("Room code is missing");
      setLoading(false);
      return;
    }
  
    try {
      const songsRef = collection(firestore, "songs");
      const q = query(songsRef, where("room_code", "==", partyCode));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        console.log("Query Results:", querySnapshot.docs.map((doc) => doc.data()));
        const songs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPartySongs(songs);
  
        // Retrieve user votes from Firestore
        const username = localStorage.getItem("displayName");
        const roomCode = localStorage.getItem("roomCode");
        if (username && roomCode) {
          const voteDocId = `${username}_${roomCode}`;
          const voteRef = doc(firestore, "votes", voteDocId);
          const docSnap = await getDoc(voteRef);
          
          if (docSnap.exists()) {
            const voteData = docSnap.data();
            setUserVotes(voteData.songs || []);
          }
        }
      } else {
        setError("No songs found for this room.");
      }
    } catch (err) {
      setError("Error fetching songs.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  

  // Handle voting logic (upvote or downvote)
  const handleVote = async (songId, voteType) => {
    const currentVote = userVotes.find(vote => vote.song_name === songId)?.vote;
    const username = localStorage.getItem("displayName");
    const roomCode = localStorage.getItem("roomCode");

    if (!username || !roomCode) {
      alert("Username or Room Code is missing.");
      return;
    }

    const song = partySongs.find((song) => song.id === songId);
    const songName = song.songName;

    // Prevent voting the same way twice
    if (currentVote === voteType) {
      alert("You already voted this way for this song.");
      return;
    }

    const newVote = { song_name: songName, vote: voteType };

    // Update partySongs state with new vote
    const updatedSongs = partySongs.map((song) => {
      if (song.id === songId) {
        const newLikes = song.likes + (voteType === "up" ? 1 : 0); // Only increment likes for upvotes
        const newDislikes = song.dislikes + (voteType === "down" ? 1 : 0); // Only increment dislikes for downvotes
        return { ...song, likes: newLikes, dislikes: newDislikes };
      }
      return song;
    });

    setPartySongs(updatedSongs);
    setUserVotes((prevVotes) => {
      const updatedVotes = prevVotes.filter((vote) => vote.song_name !== songName);
      updatedVotes.push(newVote);
      return updatedVotes;
    });

    try {
      const voteDocId = `${username}_${roomCode}`;
      const voteRef = doc(firestore, "votes", voteDocId);
      const docSnap = await getDoc(voteRef);

      let songsArray = [];
      if (docSnap.exists()) {
        const docData = docSnap.data();
        songsArray = docData.songs || [];
        const existingVoteIndex = songsArray.findIndex(
          (vote) => vote.song_name === songName
        );

        if (existingVoteIndex > -1) {
          songsArray[existingVoteIndex] = newVote;
        } else {
          songsArray.push(newVote);
        }
      } else {
        songsArray.push(newVote);
      }

      await setDoc(voteRef, { songs: songsArray }, { merge: true });

      // Update song's likes and dislikes in Firestore
      const songRef = doc(firestore, "songs", songId);
      await updateDoc(songRef, {
        likes: updatedSongs.find((song) => song.id === songId).likes,
        dislikes: updatedSongs.find((song) => song.id === songId).dislikes,
      });
    } catch (err) {
      console.error("Error updating vote:", err);
      alert("Failed to update vote. Please try again.");
    }
  };
  
  


  useEffect(() => {
    fetchPartySongs();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  /*return (
    <div className="vote-screen">
      <h1>Vote for Songs</h1>
      {partySongs.length > 0 ? (
        partySongs.map((song) => {
          const previousVote = userVotes.find(vote => vote.song_name === song.songName);
          const currentVote = previousVote ? previousVote.vote : null;
          return (
            <div key={song.id} className="vote-card">
              <h3>{song.songName || "No Song Name"}</h3>
              <p>{song.artist || "Unknown Artist"}</p>
              
          
              {song.songImage && (
                <img src={song.songImage} alt={`${song.songName} album cover`} style={{ width: "150px", height: "150px" }} />
              )}
              
              <div>
                <button
                  onClick={() => handleVote(song.id, "up")}
                  disabled={currentVote === "up"}
                  className={currentVote === "up" ? "disabled" : ""}
                  style={{ backgroundColor: currentVote === "up" ? "gray" : "" }}
                >
                  ⬆️ Upvote
                </button>
                <button
                  onClick={() => handleVote(song.id, "down")}
                  disabled={currentVote === "down"}
                  className={currentVote === "down" ? "disabled" : ""}
                  style={{ backgroundColor: currentVote === "down" ? "gray" : "" }}
                >
                  ⬇️ Downvote
                </button>
              </div>
              <div>
                {song.likes || 0} Likes | {song.dislikes || 0} Dislikes
              </div>
            </div>
          );
        })
      ) : (
        <p>No songs to vote on.</p>
      )}
      <NavBar />
    </div>
  );  
};*/
  return (
    <div className="vote-screen">
      <h1>Vote for Songs</h1>
      {partySongs.length > 0 ? (
        partySongs.map((song) => {
          const previousVote = userVotes.find(vote => vote.song_name === song.songName);
          const currentVote = previousVote ? previousVote.vote : null;

          // Log to verify song data, especially songImage
          console.log("Song Data:", song);
          console.log("Song Image URL:", song.songImage);

          return (
            <div key={song.id} className="vote-card">
              <h3>{song.songName || "No Song Name"}</h3>
              <p>{song.artist || "Unknown Artist"}</p>

              {/* Render the album image with error handling */}
              {song.songImage ? (
                <img
                  src={song.songImage}
                  alt={`${song.songName} album cover`}
                  style={{ width: "150px", height: "150px" }}
                  onError={(e) => {
                    console.log("Image failed to load, setting fallback image.");
                    e.target.src = 'path/to/fallback-image.jpg'; // Fallback image
                  }}
                />
              ) : (
                <p>No Image Available</p>  // Display a message when there's no image
              )}

              <div>
                <button
                  onClick={() => handleVote(song.id, "up")}
                  disabled={currentVote === "up"}
                  className={currentVote === "up" ? "disabled" : ""}
                  style={{ backgroundColor: currentVote === "up" ? "gray" : "" }}
                >
                  ⬆️ Upvote
                </button>
                <button
                  onClick={() => handleVote(song.id, "down")}
                  disabled={currentVote === "down"}
                  className={currentVote === "down" ? "disabled" : ""}
                  style={{ backgroundColor: currentVote === "down" ? "gray" : "" }}
                >
                  ⬇️ Downvote
                </button>
              </div>
              <div>
                {song.likes || 0} Likes | {song.dislikes || 0} Dislikes
              </div>
            </div>
          );
        })
      ) : (
        <p>No songs to vote on.</p>
      )}
      <NavBar />
    </div>
  );

};

export default VoteScreen;
