const authEndpoint = "https://accounts.spotify.com/authorize";
const clientId = "cab4bfd5f51944b39a4da66113fd22a2";  // Replace with your actual client ID
const redirectUri = "http://localhost:3000/callback"; // Replace with your redirect URI to the backend
const scopes = [
  "user-read-private",
  "user-read-email",
  "playlist-read-private",
  "playlist-modify-public",
  "playlist-modify-private",
  "user-library-read",
  "user-library-modify"
];

// Construct the login URL
const loginUrl = `${authEndpoint}?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scopes.join("%20")}&show_dialog=true`;

// Function to retrieve the access token from the URL (for frontend)
export const getTokenFromUrlFrontend = () => {
  if (window.location.hash) {
    const hash = window.location.hash.substring(1); // Remove the '#' symbol
    const params = new URLSearchParams(hash);

    return {
      access_token: params.get("access_token"),
      token_type: params.get("token_type"),
      expires_in: params.get("expires_in"),
    };
  }
  return {}; // Return an empty object if no hash fragment
};

export { loginUrl }; // Export the loginUrl for use in the frontend
