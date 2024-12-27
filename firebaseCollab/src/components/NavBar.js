import React from 'react';
import { useNavigate } from 'react-router-dom';

const NavBar = () => {
  const navigate = useNavigate();

  return (
    <div className="nav-bar">
      <button onClick={() => navigate('/vote')}>Vote</button>
      <button onClick={() => navigate('/search')}>Search</button>
      <button onClick={() => navigate('/stats')}>Stats</button>
    </div>
  );
};

export default NavBar;
