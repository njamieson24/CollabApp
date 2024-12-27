import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, set, get, update, remove } from "firebase/database";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, query, where, addDoc, updateDoc, increment } from "firebase/firestore"; // Combine imports from firestore
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCEXdHxxRzt8dDRQdzXheJwGgvrbSy1NQI",
  authDomain: "collabapp-7ae7b.firebaseapp.com",
  databaseURL: "https://collabapp-7ae7b-default-rtdb.firebaseio.com",
  projectId: "collabapp-7ae7b",
  storageBucket: "collabapp-7ae7b.firebasestorage.app",
  messagingSenderId: "831399872274",
  appId: "1:831399872274:web:8f658fa6c82b96786895cb",
  measurementId: "G-Q7WKPG867K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);  // Realtime Database reference
const firestore = getFirestore(app);  // Firestore reference
const auth = getAuth(app);  // Firebase Authentication reference

// Helper function to generate a random 4-digit room code
// Helper function to generate a random 6-digit room code
function generateRandomRoomCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();  // Generates a 6-digit code
  }
  

// Function to create a new party room in Firestore
export const createPartyRoom = async () => {
  const roomCode = generateRandomRoomCode();  // Generate a random room code
  const roomRef = doc(firestore, "party_rooms", roomCode);  // Reference to 'party_rooms' collection in Firestore

  // Room data to be stored
  const roomData = {
    roomCode, // Store the generated room code in the document
    createdAt: new Date()  // Timestamp of room creation
  };

  try {
    // Create the document in the 'party_rooms' collection
    await setDoc(roomRef, roomData);
    console.log("Room created successfully:", roomCode);
  } catch (error) {
    console.error("Error creating room:", error);
  }

  return roomCode;  // Return the room code for use in the UI
};

// Function to add a new user and associate them with a room
// Function to add a new user and associate them with a room

// Sample addUserToRoom function
// Function to add a user to the users array in a room
export const addUserToRoom = async (roomCode, displayName) => {
    const roomRef = doc(firestore, "party_rooms", roomCode);

    try {
        const roomDoc = await getDoc(roomRef);

        if (roomDoc.exists()) {
            const roomData = roomDoc.data();
            const users = Array.isArray(roomData.users) ? roomData.users : []; // Ensure users is an array

            // Check if the displayName already exists in the array
            const userExists = users.some(user => user.display_name === displayName);

            if (userExists) {
                console.log("User already exists in the room.");
                return false;
            }

            // Add the new user to the array with only display_name
            const updatedUsers = [...users, { display_name: displayName }];

            // Update the room document
            await updateDoc(roomRef, { users: updatedUsers });

            console.log("User added successfully.");
            return true;
        } else {
            console.error("Room not found.");
            return false;
        }
    } catch (error) {
        console.error("Error adding user to room:", error);
        throw new Error("An error occurred while adding the user to the room.");
    }
};



export const fetchSongVoteStats = async (roomCode, songId) => {
    if (!roomCode || !songId) {
      console.error("Room code or Song ID is undefined or invalid.");
      return { error: "Room code and Song ID are required." };
    }
  
    try {
      // Reference to the song document
      const songRef = doc(firestore, "songs", songId);
      const songSnapshot = await getDoc(songRef);
  
      if (songSnapshot.exists()) {
        const songData = songSnapshot.data();
        
        // Retrieve current likes and dislikes
        const { likes, dislikes } = songData;
  
        return {
          songId,
          likes,
          dislikes,
          totalVotes: likes - dislikes,  // Calculate total score if needed
        };
      } else {
        return { error: "Song not found." };
      }
    } catch (error) {
      console.error("Error fetching song vote stats:", error);
      return { error: "An error occurred while fetching vote stats." };
    }
  };
  

  
  
export const checkRoomExists = async (roomCode) => {
    try {
      const roomRef = doc(firestore, "party_rooms", roomCode);
      const roomSnapshot = await getDoc(roomRef);
  
      if (roomSnapshot.exists()) {
        console.log("Room exists:", roomCode);
        return true;
      } else {
        console.warn("Room does not exist:", roomCode);
        return false;
      }
    } catch (error) {
      console.error("Error checking room existence:", error);
      return false;
    }
  };

  // Firebase function to handle user login and associate the display name with the room
export const handleUserLogin = async (email, password, roomCode, displayName) => {
    try {
      // Sign in the user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
  
      // Check if the room exists
      const roomExists = await checkRoomExists(roomCode);
      if (!roomExists) {
        return { error: "Room does not exist." };
      }
  
      // Associate the user with the room and their display name
      await addUserToRoom(userId, roomCode, displayName);
  
      // Add the display name to the party room document
      const roomRef = doc(firestore, "party_rooms", roomCode);
      await updateDoc(roomRef, {
        [displayName]: userId,  // Store the display name in the room document with the user ID as value
      });
  
      return { success: true, userId, roomCode, displayName };
    } catch (error) {
      console.error("Error logging in user:", error);
      return { error: error.message };
    }
  };
  
  
  

// Function to fetch room details from Firestore
export const fetchRoomDetailsFromFirestore = async (roomCode) => {
  const roomRef = doc(firestore, "party_rooms", roomCode);
  const roomSnapshot = await getDoc(roomRef);

  if (roomSnapshot.exists()) {
    return roomSnapshot.data();  // Return room data
  } /*else {
    return { error: "Room not found." };  // Return error if the room does not exist
  }*/
};

// Firebase Authentication functions
export const signUpWithEmail = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error) {
    return { error: error.message };
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error) {
    return { error: error.message };
  }
};

// Other Firebase functions (Firestore, Realtime Database)
export const writeData = (path, data) => {
  const reference = ref(db, path);
  set(reference, data)
    .then(() => console.log("Data saved"))
    .catch((error) => console.error("Error saving data:", error));
};

export const readData = (path) => {
  const reference = ref(db, path);
  return get(reference)
    .then((snapshot) => {
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        return null;
      }
    })
    .catch((error) => console.error("Error getting data:", error));
};

// Firestore operations for managing songs in a party room
// Firestore operations for managing songs in a party room

export const addSongToFirestore = async (roomCode, songName, songUrl, artist, songImage) => {
    // Generate the document ID using songName and roomCode (e.g., "songName-roomCode")
    const songID = `${songName.toLowerCase().replace(/\s+/g, '-')}-${roomCode}`;
  
    // Reference to the 'songs' collection, using songID as the document ID
    const songsRef = doc(firestore, "songs", songID);  // 'songs' collection, with songID as the document ID
  
    // Prepare the song data to be added to Firestore
    const songData = {
      songName,     // Song name
      songUrl,      // Song URL
      artist,       // Artist name
      songImage,    // Album cover image URL
      likes: 0,     // Initial likes
      dislikes: 0,  // Initial dislikes
      ranking: 0,   // Initial ranking
      room_code: roomCode, // Room code to associate the song with a party
    };
  
    // Log the song data to check that it's not blank
    console.log("Preparing to add song with data:", songData);
  
    try {
      // Check if the song already exists in Firestore
      const songDoc = await getDoc(songsRef);
      if (songDoc.exists()) {
        // If the document already exists, log that it's a duplicate and return
        console.log("Song already exists in the party.");
        return;
      }
  
      // Attempt to add the song data to Firestore if it doesn't already exist
      await setDoc(songsRef, songData);
      console.log("Song added successfully.");
    } catch (error) {
      // Log detailed error if the document addition fails
      console.error("Error adding song to Firestore:", error);
      console.error("Song data:", songData);
    }
  };
  
/*export const addSongToFirestore = async (roomCode, songName, songUrl, artist) => {
    // Generate the document ID using songName and roomCode (e.g., "songName-roomCode")
    const songID = `${songName.toLowerCase().replace(/\s+/g, '-')}-${roomCode}`;
  
    // Reference to the 'songs' collection, using songID as the document ID
    const songsRef = doc(firestore, "songs", songID);  // 'songs' collection, with songID as the document ID
    
    // Prepare the song data to be added to Firestore
    const songData = {
      songName,     // Song name
      songUrl,      // Song URL
      artist,       // Artist name
      likes: 0,     // Initial likes
      dislikes: 0,  // Initial dislikes
      ranking: 0,   // Initial ranking
      room_code: roomCode, // Room code to associate the song with a party
    };
  
    // Log the song data to check that it's not blank
    console.log("Preparing to add song with data:", songData);
    
    try {
        // Check if the song already exists in Firestore
        const songDoc = await getDoc(songsRef);
        if (songDoc.exists()) {
          // If the document already exists, log that it's a duplicate and return
          console.log("Song already exists in the party.");
          return;
        }
    
        // Attempt to add the song data to Firestore if it doesn't already exist
        await setDoc(songsRef, songData);
        console.log("Song added successfully.");
      } catch (error) {
        // Log detailed error if the document addition fails
        console.error("Error adding song to Firestore:", error);
        console.error("Song data:", songData);
      }
  };*/
  



  
  export const fetchSongsFromFirestore = async (roomCode) => {
    if (!roomCode) {
      console.error("Room code is undefined or invalid.");
      return { error: "Room code is required." };
    }
  
    try {
      // Reference the correct collection where songs are stored
      const songsRef = collection(firestore, "songs");  // Correct collection name
      
      // Query where the 'room_code' field matches the current user's room
      const q = query(songsRef, where("room_code", "==", roomCode));
  
      // Execute the query
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        // Map the query results to an array of song data
        const songs = querySnapshot.docs.map((doc) => ({
          id: doc.id, // Document ID for operations like voting
          ...doc.data(), // Spread the rest of the fields (song_name, likes, dislikes, artist)
        }));
  
        return songs; // Return the array of songs
      } else {
        return { error: "No songs found for this room." };
      }
    } catch (error) {
      console.error("Error fetching songs:", error);
      return { error: "An error occurred while fetching songs." };
    }
  };



  export const handleVote = async (userId, roomCode, songId, voteType) => {
    if (!userId || !roomCode || !songId || !voteType) {
      console.error("Invalid parameters provided.");
      return { error: "All parameters are required." };
    }
  
    try {
      // References
      const votesRef = collection(firestore, "votes");
      const songDocRef = doc(firestore, "songs", songId);
  
      // Check if the user has already voted for this song in this room
      const userVoteQuery = query(votesRef, where("user_id", "==", userId), where("room_code", "==", roomCode), where("song_id", "==", songId));
      const existingVoteSnapshot = await getDocs(userVoteQuery);
  
      let existingVote = null;
      if (!existingVoteSnapshot.empty) {
        existingVote = existingVoteSnapshot.docs[0]; // Get the first match
      }
  
      if (existingVote) {
        const existingVoteData = existingVote.data();
        const existingVoteType = existingVoteData.vote;
  
        // Case 1: User switches vote (e.g., upvote -> downvote)
        if (existingVoteType !== voteType) {
          // Update the vote in the votes collection
          await updateDoc(existingVote.ref, { vote: voteType });
  
          // Update the song's likes and dislikes
          if (voteType === "upvote") {
            await updateDoc(songDocRef, {
              likes: increment(1),
              dislikes: increment(-1),
            });
          } else if (voteType === "downvote") {
            await updateDoc(songDocRef, {
              likes: increment(-1),
              dislikes: increment(1),
            });
          }
        }
      } else {
        // Case 2: First-time voting
        // Add the vote to the votes collection
        await setDoc(doc(votesRef), {
          user_id: userId,
          room_code: roomCode,
          song_id: songId,
          vote: voteType,
          timestamp: new Date(),
        });
  
        // Update the song's likes or dislikes
        if (voteType === "upvote") {
          await updateDoc(songDocRef, { likes: increment(1) });
        } else if (voteType === "downvote") {
          await updateDoc(songDocRef, { dislikes: increment(1) });
        }
      }
  
      return { success: true, message: "Vote processed successfully." };
    } catch (error) {
      console.error("Error handling vote:", error);
      return { error: "An error occurred while processing the vote." };
    }
  };


// Firestore operation to update song votes
export const updateSongVotes = async (songId, voteType, isUndo = false) => {
    try {
      const songRef = doc(firestore, "songs", songId);
      const songDoc = await getDoc(songRef);
  
      if (!songDoc.exists()) {
        console.error("Song not found!");
        return;
      }
  
      const songData = songDoc.data();
      let updateField = {};
  
      if (voteType === "upvote") {
        updateField = isUndo ? { likes: increment(-1) } : { likes: increment(1) };
      } else if (voteType === "downvote") {
        updateField = isUndo ? { dislikes: increment(-1) } : { dislikes: increment(1) };
      }
  
      await updateDoc(songRef, updateField);
      console.log(`Successfully updated ${voteType} for song with ID: ${songId}`);
    } catch (error) {
      console.error("Error updating song votes:", error);
      throw new Error("Error updating song votes");
    }
  };

export { app, db, firestore, analytics, auth };  // Export the auth object here
