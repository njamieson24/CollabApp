const apiUrl = 'https://api.spotify.com/v1/search';

export const fetchSearchResults = async (query, accessToken) => {
  try {
    const response = await fetch(`${apiUrl}?q=${encodeURIComponent(query)}&type=track`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401) {
      // Token may be expired or invalid
      return null;
    }

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching search results:', error);
    throw error;
  }
};

export const refreshAccessToken = async () => {
  // This is a placeholder function; implement actual token refresh logic here
  // Redirect to Spotify's login page if no valid token is found
  const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.REACT_APP_REDIRECT_URI;
  const scopes = 'user-library-read user-read-private';
  const loginUrl = `https://accounts.spotify.com/authorize?response_type=token&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;

  window.location.href = loginUrl;
};
