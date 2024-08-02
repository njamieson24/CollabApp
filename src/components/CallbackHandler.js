import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CallbackHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');

    if (accessToken) {
      localStorage.setItem('spotify_access_token', accessToken);
      navigate('/'); // Redirect to home after storing token
    } else {
      console.error('No access token found in URL');
    }
  }, [navigate]);

  return <div>Processing...</div>;
};

export default CallbackHandler;
