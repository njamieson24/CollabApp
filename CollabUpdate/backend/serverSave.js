import express from "express";
import fetch from "node-fetch";
import mysql from "mysql2";
import bodyParser from "body-parser";
import { getTokenFromUrlBackend } from "./utils/spotifyAuth.js";
import cors from "cors";

const app = express();
const port = 5000;
const redirectUri = "http://localhost:5000/callback";
const clientId = "cab4bfd5f51944b39a4da66113fd22a2";
const clientSecret = "3da5f4d6a5894685a85261c23148ac7f";

// MySQL database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "spotify_party",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    process.exit(1);
  } else {
    console.log("Connected to the MySQL database.");
  }
});

app.use(bodyParser.json());
app.use(cors());

// Helper function to generate a random 4-digit room code
function generateRandomRoomCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Spotify login route
app.get("/login", (req, res) => {
  const loginUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user-read-private%20user-read-email`;
  console.log("Redirecting to Spotify login URL:", loginUrl);
  res.redirect(loginUrl);
});

// Spotify callback route
app.get("/callback", async (req, res) => {
  const authorizationCode = req.query.code;

  if (!authorizationCode) {
    return res.status(400).send("Authorization code missing");
  }

  try {
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: authorizationCode,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.access_token) {
      res.redirect(`http://localhost:3000/?access_token=${tokenData.access_token}`);
    } else {
      res.status(400).send("Error exchanging authorization code");
    }
  } catch (error) {
    console.error("Error during token exchange:", error);
    res.status(500).send("Internal server error");
  }
});

// Create a new party room
app.post("/create-party", (req, res) => {
  const roomCode = generateRandomRoomCode();
  const query = "INSERT INTO party_rooms (room_code) VALUES (?)";

  db.query(query, [roomCode], (err) => {
    if (err) {
      console.error("Error creating party room:", err);
      return res.status(500).send("Error creating party room.");
    }
    res.status(200).json({ roomCode });
  });
});

// Join a party room
app.get("/join-party/:roomCode", (req, res) => {
  const roomCode = req.params.roomCode;
  const query = "SELECT * FROM party_rooms WHERE room_code = ?";

  db.query(query, [roomCode], (err, results) => {
    if (err) {
      console.error("Error querying the database:", err);
      return res.status(500).json({ message: "Error checking the party code" });
    }

    if (results.length > 0) {
      res.json({ exists: true, roomCode });
    } else {
      res.status(404).json({ exists: false });
    }
  });
});

// Fetch room code details
app.get("/room-code/:roomCode", (req, res) => {
  const roomCode = req.params.roomCode;
  const query = "SELECT * FROM party_rooms WHERE room_code = ?";

  db.query(query, [roomCode], (err, results) => {
    if (err) {
      console.error("Error fetching room code:", err);
      return res.status(500).send("Error fetching room code.");
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Room code not found" });
    }

    res.json(results[0]);
  });
});

// Add a song to a party room
app.post("/add-song", (req, res) => {
  const { roomCode, songName, songUrl } = req.body;

  if (!roomCode || !songName || !songUrl) {
    return res.status(400).send("Room code, song name, and URL are required.");
  }

  const checkQuery = "SELECT * FROM songs WHERE room_code = ? AND song_name = ?";
  db.query(checkQuery, [roomCode, songName], (err, results) => {
    if (err) {
      console.error("Error checking if song exists:", err);
      return res.status(500).send("Error checking song existence.");
    }

    if (results.length > 0) {
      return res.status(400).send("Song already added.");
    }

    const insertQuery = "INSERT INTO songs (room_code, song_name, song_url, likes, dislikes) VALUES (?, ?, ?, 0, 0)";
    db.query(insertQuery, [roomCode, songName, songUrl], (err) => {
      if (err) {
        console.error("Error adding song:", err);
        return res.status(500).send("Error adding song.");
      }
      res.status(200).send("Song added successfully.");
    });
  });
});

// Fetch all songs in a party room
app.get("/party-songs/:partyCode", (req, res) => {
  const partyCode = req.params.partyCode;
  const query = "SELECT id, song_name, likes, dislikes FROM songs WHERE room_code = ?";

  db.query(query, [partyCode], (err, results) => {
    if (err) {
      console.error("Error fetching songs:", err);
      return res.status(500).send("Error fetching songs.");
    }
    res.json(results);
  });
});

// Vote on a song
// Vote on a song
app.post("/vote-song", (req, res) => {
    const { partyCode, songId, voteType } = req.body;
  
    if (!partyCode || !songId || !voteType) {
      return res.status(400).send("Party code, song ID, and vote type are required.");
    }
  
    const voteIncrement = voteType === "up" ? 1 : -1;
  
    // First, check if the song exists in the party
    const checkSongQuery = "SELECT * FROM songs WHERE id = ? AND room_code = ?";
    db.query(checkSongQuery, [songId, partyCode], (err, results) => {
      if (err) {
        console.error("Error checking song existence:", err);
        return res.status(500).send("Error checking song existence.");
      }
  
      if (results.length === 0) {
        return res.status(404).send("Song not found in the party.");
      }
  
      // Update the likes or dislikes count for the song
      const updateVoteQuery =
        voteType === "up"
          ? "UPDATE songs SET likes = likes + 1 WHERE id = ?"
          : "UPDATE songs SET dislikes = dislikes + 1 WHERE id = ?";
  
      db.query(updateVoteQuery, [songId], (err) => {
        if (err) {
          console.error("Error updating song votes:", err);
          return res.status(500).send("Error updating song votes.");
        }
  
        res.status(200).send("Vote registered successfully.");
      });
    });
  });
  
  // Remove a vote from a song
app.post("/remove-vote", (req, res) => {
    const { partyCode, songId, voteType } = req.body;
  
    if (!partyCode || !songId || !voteType) {
      return res.status(400).send("Party code, song ID, and vote type are required.");
    }
  
    // Determine the column to update (likes or dislikes)
    const voteColumn = voteType === "up" ? "likes" : "dislikes";
    
    // Update the votes by decrementing the relevant column
    const updateVoteQuery = `UPDATE songs SET ${voteColumn} = ${voteColumn} - 1 WHERE id = ?`;
  
    db.query(updateVoteQuery, [songId], (err) => {
      if (err) {
        console.error("Error removing vote:", err);
        return res.status(500).send("Error removing vote.");
      }
  
      res.status(200).send("Vote removed successfully.");
    });
  });
  
  // Fetch the highest-ranked song in a party room (based on the 'ranking' column)
app.get("/highest-ranked-song/:roomCode", (req, res) => {
    const roomCode = req.params.roomCode;
  
    // Query to get the highest-ranked song using the 'ranking' column
    const query = `
      SELECT id, song_name, ranking
      FROM songs
      WHERE room_code = ?
      ORDER BY ranking DESC
      LIMIT 1
    `;
  
    db.query(query, [roomCode], (err, results) => {
      if (err) {
        console.error("Error fetching highest-ranked song:", err);
        return res.status(500).send("Error fetching highest-ranked song.");
      }
  
      if (results.length === 0) {
        return res.status(404).send("No songs found for this room.");
      }
  
      res.json(results[0]);
    });
  });
  

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
