import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Chart from "chart.js/auto";
import "./DJStats.css"; // Import the CSS file

const DJStats = () => {
  const { roomCode } = useParams(); // Grab the roomCode from the URL
  const [songs, setSongs] = useState([]);
  const [error, setError] = useState("");
  const chartRef = useRef(null); // Reference to the canvas element for the chart
  const chartInstanceRef = useRef(null); // Reference to store the Chart.js instance

  useEffect(() => {
    // Fetch songs for the given roomCode from the backend
    const fetchSongs = async () => {
      try {
        const response = await fetch(`http://localhost:5000/songs-by-ranking/${roomCode}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch songs.");
        }

        const data = await response.json();
        setSongs(data);
      } catch (error) {
        setError("Error fetching songs. Please try again.");
        console.error("Error fetching songs:", error);
      }
    };

    fetchSongs();
  }, [roomCode]); // Fetch songs whenever the roomCode changes

  useEffect(() => {
    if (songs.length > 0) {
      // Prepare data for the chart
      const chartData = {
        labels: songs.map(song => song.song_name), // Song names as labels
        datasets: [
          {
            label: "Song Rankings",
            data: songs.map(song => song.ranking), // Rankings for each song
            backgroundColor: songs.map(song =>
              song.ranking >= 0 ? "#6a0dad" : "#b30000" // Purple for positive rankings, red for negative
            ),
            borderColor: songs.map(song =>
              song.ranking >= 0 ? "#4b007d" : "#7a0000" // Darker shades for borders
            ),
            borderWidth: 1,
            borderRadius: 5, // Rounded edges on bars
          },
        ],
      };

      const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            min: Math.min(...songs.map(song => song.ranking)) - 1,
            max: Math.max(...songs.map(song => song.ranking)) + 1,
            ticks: {
              color: "#888888", // Light gray text for Y-axis labels
              font: { weight: "bold" }, // Bolded Y-axis labels
            },
            grid: {
              color: (context) => (context.tick.value === 0 ? "#888888" : "rgba(136, 136, 136, 0.2)"), // Bold Y=0 line, faint others
              lineWidth: (context) => (context.tick.value === 0 ? 2 : 1), // Bold for Y=0, faint lines regular thickness
              drawBorder: false, // Remove border around grid area
            },
            border: {
              display: true,
              color: "#888888", // Light gray Y-axis border
              width: 2, // Bold border for Y-axis
            },
          },
          x: {
            ticks: {
              color: "#888888", // Light gray text for X-axis labels
            },
            grid: {
              color: "rgba(136, 136, 136, 0.2)", // Faint grid lines for X-axis
              drawBorder: false, // Remove border around grid area
            },
            border: {
              display: true,
              color: "#888888", // Light gray X-axis border
              width: 1, // Regular thickness for X-axis border
            },
          },
        },
        plugins: {
          legend: {
            labels: {
              color: "#888888", // Light gray legend text
              font: { weight: "bold" },
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
  }, [songs]); // Run this effect when songs data is updated

  return (
    <div className="dj-stats-container">
      <h1 className="dj-title">DJ Stats for Room: {roomCode}</h1>

      {error && <p className="error-message">{error}</p>}

      {/* Bar chart */}
      <div className="chart-container">
        <canvas ref={chartRef} />
      </div>

      {/* List of songs */}
      <ol className="song-list">
        {songs.map((song, index) => (
          <li key={song.id} className="song-item">
            <strong>
              {index + 1}. {song.song_name}
            </strong>{" "}
            (Ranking: {song.ranking})
          </li>
        ))}
      </ol>
    </div>
  );
};

export default DJStats;
