const CLIENT_ID = "3d7861e71e754da88d9f19448b356ab0";
const CLIENT_SECRET = "1f2762929a094a3297bdc61af90dbf51";



// Function to send data to PHP
async function sendToPHP(track) {
  const data = {
    song_name: track.name,
    artist_name: track.artists[0].name,
    album_image: track.album.images[0].url,
    room_code: roomCode,
  };

  console.log("Sending data to PHP:", data);

  try {
    const response = await fetch('playlist.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error("Failed to send data:", response.statusText);
    } else {
      console.log("Data sent to PHP successfully");
    }
  } catch (error) {
    console.error("Error sending data to PHP:", error);
  }
}


document.getElementById("button-search").addEventListener("click", function() {
  search();

});

async function search() {
  const searchInput = document.getElementById("searchInput").value;
  console.log("Search for " + searchInput);

  // API Access Token
  const authParameters = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET
  };

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', authParameters);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    const accessToken = data.access_token;

    // Get request using search to get the Track IDs
    const searchParameters = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
      }
    };

    const searchResponse = await fetch('https://api.spotify.com/v1/search?q=' + searchInput + '&type=track', searchParameters);
    if (!searchResponse.ok) {
      throw new Error('Network response was not ok');
    }
    const searchData = await searchResponse.json();

    // Render track results
    renderTracks(searchData.tracks.items);
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}

function renderTracks(tracks) {
  const container = document.getElementById("tracksContainer");
  container.innerHTML = "";

  tracks.forEach(function(track) {
    const card = document.createElement("div");
    card.classList.add("card", "d-flex", "align-items-center", "flex-row");
    card.innerHTML = `
      <img src="${track.album.images[0].url}" class="card-img-left img-thumbnail align-self-center" alt="${track.name}">
      <div class="card-body">
        <h4 style="font-size: 2.5rem; font-family: Barlow, sans-serif; font-weight: 700;" class="card-title">${track.name}</h4>
        <p style="font-size: 2.2rem; color: #cfcfcf; font-family: Barlow, sans-serif;" class="card-text">${track.artists[0].name}</p>
      </div>
    `;

    card.addEventListener('click', function() {
      console.log("Clicked Song Info:");
      console.log("Song ID:", track.id);
      console.log("Song Name:", track.name);
      console.log("Artist Name:", track.artists[0].name);
      console.log("Album Name:", track.album.name);
      console.log("Album Image URL:", track.album.images[0].url);

      // Send data to PHP
      sendToPHP(track);
    });

    container.appendChild(card);
  });
}
