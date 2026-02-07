import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import HomeCarousel from './components/homecarousel';
import NavBar from './components/navbar';
import ArtPage from './components/artpage';
import './App.css';

const paintingDropdown = Array.from(
  { length: 1900 - 1840 + 1 },
  (_, i) => {
    const year = 1840 + i;
    return {
      label: year.toString(),
      link: `/painting/${year}`,
    };
  }
);

const sketchDropdown = [
  { label: "Pencil", link: `/sketch/pencil` },
  { label: "Ink", link: `/sketch/ink` },
];

// Create a wrapper so useLocation is inside BrowserRouter
const AppContent: React.FC = () => {
  const location = useLocation();
  const isHomepage = location.pathname === "/";

  return (
    <>
      <NavBar
        artistName="Jean-Léon Gérôme"
        dropdownItems={[
          { label: "PAINTING", dropdown: paintingDropdown },
          { label: "SKETCH", dropdown: sketchDropdown },
        ]}
        linkItems={[{ label: "ABOUT", link: "/about" }]}
      />

      {isHomepage && <div className="overlay" />}

      <Routes>
        <Route path="/" element={<HomeCarousel />} />
        <Route path="/painting/:year" element={<ArtPage />} />
        <Route path="/sketch/:type" element={<ArtPage />} />
        <Route path="/about" element={<div>About page coming soon</div>} />
      </Routes>
    </>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
