import React, { createContext, useState } from 'react';

export const PlaylistContext = createContext();

export const PlaylistProvider = ({ children }) => {
  const [playlist, setPlaylist] = useState([]);

  return (
    <PlaylistContext.Provider value={{ playlist, setPlaylist }}>
      {children}
    </PlaylistContext.Provider>
  );
};
