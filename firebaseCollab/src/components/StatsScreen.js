import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { collection, query, where, getDocs } from "firebase/firestore";
import { firestore } from "../firebase"; // Firestore reference
import "./DJStats.css"; // Import the CSS file
import NavBar from "./NavBar";

const StatsScreen = () => {
  const roomCode = localStorage.getItem("roomCode"); // Grab the roomCode from the URL
  const [songs, setSongs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // Loading state for data fetching
  const chartRef = useRef(null); // Reference to the canvas element for the chart
  const chartInstanceRef = useRef(null); // Reference to store the Chart.js instance

  const fetchPartySongs = async () => {
    try {
      const songsRef = collection(firestore, "songs");
      const q = query(songsRef, where("room_code", "==", roomCode));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const songs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          songName: doc.data().songName || "Unknown Song",
          artist: doc.data().artist || "Unknown Artist",
          songImage: doc.data().songImage || "",
          likes: doc.data().likes || 0,
          dislikes: doc.data().dislikes || 0,
          ranking: (doc.data().likes || 0) - (doc.data().dislikes || 0),
        }));
        setSongs(songs);
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

  useEffect(() => {
    fetchPartySongs(); // Fetch songs when the component mounts or roomCode changes
  }, [roomCode]); // Depend on roomCode to re-fetch when it changes

  useEffect(() => {
    if (songs.length > 0) {
      // Sort songs by ranking (highest to lowest)
      const sortedSongs = [...songs].sort((a, b) => b.ranking - a.ranking);

      // Prepare data for the chart
      const chartData = {
        labels: sortedSongs.map((song) => song.songName),
        datasets: [
          {
            label: "Song Rankings",
            data: sortedSongs.map((song) => song.ranking),
            backgroundColor: sortedSongs.map((song) =>
              song.ranking >= 0 ? "#6a0dad" : "#b30000"
            ), // Purple for positive, red for negative
            borderColor: sortedSongs.map((song) =>
              song.ranking >= 0 ? "#4b007d" : "#7a0000"
            ),
            borderWidth: 1,
          },
        ],
      };

      const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: "#888888" },
            grid: { color: "rgba(136, 136, 136, 0.2)" },
          },
          x: {
            ticks: { color: "#888888" },
            grid: { color: "rgba(136, 136, 136, 0.2)" },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const song = sortedSongs[context.dataIndex];
                return `${song.artist} - ${song.songName}`;
              },
            },
          },
        },
      };

      // Destroy previous chart if it exists
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      // Create new chart
      chartInstanceRef.current = new Chart(chartRef.current, {
        type: "bar",
        data: chartData,
        options: chartOptions,
      });
    }
  }, [songs]);

  return (
    <div>
      <div className="dj-stats-container">
        <h1 className="dj-title">DJ Stats for Room: {roomCode}</h1>

        {error && <p className="error-message">{error}</p>}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {/* Bar chart */}
            <div className="chart-container">
              <canvas ref={chartRef} />
            </div>

            {/* List of songs */}
            <ol className="song-list">
              {songs
                .sort((a, b) => b.ranking - a.ranking)
                .map((song, index) => (
                  <li key={song.id} className="song-item">
                    <strong>
                      {index + 1}. {song.songName}
                    </strong>{" "}
                    by {song.artist} (Likes: {song.likes}, Dislikes: {song.dislikes}, Ranking:{" "}
                    {song.ranking})
                  </li>
                ))}
            </ol>
          </>
        )}
      </div>
      <NavBar />
    </div>
  );
};

export default StatsScreen;
