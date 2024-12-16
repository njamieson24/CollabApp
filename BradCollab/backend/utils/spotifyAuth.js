const authEndpoint = "https://accounts.spotify.com/authorize";
const clientId = "cab4bfd5f51944b39a4da66113fd22a2";  // Replace with your actual client ID
const redirectUri = "http://localhost:3000/callback";
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
const loginUrl = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join("%20")}&response_type=token&show_dialog=true`;

// Function to retrieve the access token from the URL (for frontend)
const getTokenFromUrlFrontend = () => {
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

// Function to retrieve the access token from query parameters (for backend)
const getTokenFromUrlBackend = (req) => {
  if (req.query.access_token) {
    return {
      access_token: req.query.access_token,
      token_type: req.query.token_type,
      expires_in: req.query.expires_in,
    };
  }
  return {}; // Return an empty object if no access_token in query parameters
};

export {
  authEndpoint,
  loginUrl,
  getTokenFromUrlFrontend,
  getTokenFromUrlBackend
};
