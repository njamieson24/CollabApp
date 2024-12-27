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
  };  

  const handleVote = async (songid, voteType) => {
    const username = localStorage.getItem("displayName");
    const roomCode = localStorage.getItem("roomCode");
  
    console.log("songId", songid)
    if (!username || !roomCode) {
      alert("Username or Room Code is missing.");
      console.log("Missing credentials:", { username, roomCode });
      return;
    }
  
    const getSongName = async (songID) => {
      const songRef = doc(firestore, "songs", songID);
      const docSnap = await getDoc(songRef);
  
      if (docSnap.exists()) {
        const song_Name = docSnap.data().songName;
        console.log("Song name:", song_Name);
        return song_Name;
      } else {
        console.log("No such song!");
        return null;
      }
    };
  
    const songName = await getSongName(songid);
  
    if (!songName) {
      alert("Song name could not be fetched.");
      return;
    }
  
    console.log("Starting handleVote function", { songName, voteType, username, roomCode });
  
    const voteDocId = `${username}_${roomCode}`;
    const voteRef = doc(firestore, "votes", voteDocId);
  
    let currentVote;
    try {
      console.log("Fetching user's vote document from Firestore:", voteDocId);
      const docSnap = await getDoc(voteRef);
  
      if (docSnap.exists()) {
        const songsArray = docSnap.data().songs || [];
        console.log("Fetched songs array from document:", songsArray);
  
        const existingSong = songsArray.find((song) => song.song_name === songName);
        currentVote = existingSong ? existingSong.vote : undefined;
  
        console.log("Found matching song:", { song_name: songName, currentVote });
      } else {
        console.log("Vote document does not exist for user.");
        currentVote = undefined;
      }
    } catch (err) {
      console.error("Error fetching user's vote document:", err);
      alert("Failed to fetch current vote. Please try again.");
      return;
    }
  
    console.log("Current vote for song:", { songName, currentVote });
  
    const song = partySongs.find((song) => song.songName === songName);
    if (!song) {
      alert("Song not found.");
      console.log("Song not found in partySongs array:", { songName, partySongs });
      return;
    }
  
    if (currentVote === voteType) {
      alert("You already voted this way for this song.");
      console.log("User already voted the same way for this song:", { songName, currentVote, voteType });
      return;
    }
  
    const newVote = { song_name: songName, vote: voteType };
  
    console.log("Updating partySongs state for song:", { songName, newVote });
    const updatedSongs = partySongs.map((song) => {
      if (song.songName === songName) {
        let newLikes = song.likes;
        let newDislikes = song.dislikes;
  
        if (currentVote === "up" && voteType === "down") {
          newLikes -= 1;
          newDislikes += 1;
        } else if (currentVote === "down" && voteType === "up") {
          newLikes += 1;
          newDislikes -= 1;
        } else if (voteType === "up") {
          newLikes += 1;
        } else if (voteType === "down") {
          newDislikes += 1;
        }
  
        console.log("Updated song stats:", { newLikes, newDislikes });
        return { ...song, likes: newLikes, dislikes: newDislikes };
      }
      return song;
    });
  
    setPartySongs(updatedSongs);
    console.log("Updated partySongs state:", updatedSongs);
  
    setUserVotes((prevVotes) => {
      const updatedVotes = prevVotes.filter((vote) => vote.song_name !== songName);
      updatedVotes.push(newVote);
      console.log("Updated userVotes state:", updatedVotes);
      return updatedVotes;
    });
  
    try {
      console.log("Updating Firestore with new vote:", { voteDocId, newVote });
      const docSnap = await getDoc(voteRef);
      let songsArray = [];
      if (docSnap.exists()) {
        songsArray = docSnap.data().songs || [];
        console.log("Fetched existing songsArray from Firestore:", songsArray);
  
        const existingVoteIndex = songsArray.findIndex((song) => song.song_name === songName);
  
        if (existingVoteIndex > -1) {
          songsArray[existingVoteIndex] = newVote;
        } else {
          songsArray.push(newVote);
        }
      } else {
        songsArray.push(newVote);
      }
  
      console.log("Final songsArray to write to Firestore:", songsArray);
      await setDoc(voteRef, { songs: songsArray }, { merge: true });
  
      // Initialize updatedSong before using it
      const updatedSong = updatedSongs.find((song) => song.songName === songName);
      if (!updatedSong) {
        console.error("Could not find updatedSong in updatedSongs array.");
        alert("Failed to update song stats in Firestore.");
        return;
      }
  
      console.log("Updating song document in Firestore:", { songName, updatedSong });
      //const songRef = doc(firestore, "songs", updatedSong.songId); // Assuming songId exists in updatedSongs
      const songRef = doc(firestore, "songs", songid);
      await updateDoc(songRef, {
        likes: updatedSong.likes,
        dislikes: updatedSong.dislikes,
      });
    } catch (err) {
      console.error("Error updating vote in Firestore:", err);
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
