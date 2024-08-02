import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SearchBar from './components/SearchBar';
import CallbackHandler from './components/CallbackHandler';
import Playlist from './components/Playlist';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SearchBar />} />
        <Route path="/callback" element={<CallbackHandler />} />
        <Route path="/playlist" element={<Playlist />} />
      </Routes>
    </Router>
  );
};

export default App;
