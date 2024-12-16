import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Chart from "chart.js/auto";

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
          throw new Error('Failed to fetch songs.');
        }

        const data = await response.json();
        setSongs(data);
      } catch (error) {
        setError('Error fetching songs. Please try again.');
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
            label: 'Song Rankings',
            data: songs.map(song => song.ranking), // Rankings for each song
            backgroundColor: songs.map(song =>
              song.ranking >= 0 ? 'green' : 'red' // Green for positive rankings, red for negative
            ),
            borderColor: songs.map(song =>
              song.ranking >= 0 ? 'darkgreen' : 'darkred' // Darker color for borders
            ),
            borderWidth: 1,
          },
        ],
      };

      // Chart options with fixed size and responsive disabled
      const chartOptions = {
        responsive: false, // Disable responsive scaling
        maintainAspectRatio: false, // Allow custom sizing
        scales: {
          y: {
            beginAtZero: true,
            min: Math.min(...songs.map(song => song.ranking)) - 1, // Dynamic y-axis range
            max: Math.max(...songs.map(song => song.ranking)) + 1,
          },
        },
        plugins: {
          // Add custom drawing for the bold line
          afterDraw: (chart) => {
            const ctx = chart.ctx;
            const yAxis = chart.scales['y'];
            const zeroPosition = yAxis.getPixelForValue(0); // Calculate the position of y = 0

            if (isNaN(zeroPosition)) {
              console.warn("Y position for 0 is NaN, skipping drawing.");
              return; // Skip drawing if the value is not valid
            }

            // Ensure the context is set up before drawing
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(yAxis.left, zeroPosition); // Start at the left of the chart
            ctx.lineTo(yAxis.right, zeroPosition); // Draw to the right of the chart
            ctx.lineWidth = 3; // Make the line bold
            ctx.strokeStyle = 'black'; // Line color
            ctx.stroke();
            ctx.restore();
          }
        }
      };

      // Destroy the previous chart if it exists
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      // Create a new chart
      chartInstanceRef.current = new Chart(chartRef.current, {
        type: "bar", // Bar chart
        data: chartData,
        options: chartOptions,
      });
    }
  }, [songs]); // Run this effect when songs data is updated

  return (
    <div>
      <h1>DJ Stats for Room: {roomCode}</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Bar chart */}
      <canvas
        ref={chartRef}
        width="500" // Fixed width
        height="200" // Fixed height
      />

      {/* List of songs */}
      <ol>
        {songs.map((song, index) => (
          <li key={song.id}>
            <strong>{index + 1}. {song.song_name}</strong> (Ranking: {song.ranking})
          </li>
        ))}
      </ol>
    </div>
  );
};

export default DJStats;
