import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import HomeCarousel from "./components/homecarousel";
import NavBar from "./components/navbar";
import ArtPage from "./components/artpage";
import ArtOverlayRoute from "./components/ArtOverlayRoute";

import "./App.css";

const paintingDropdown = Array.from({ length: 1900 - 1840 + 1 }, (_, i) => {
  const year = 1840 + i;
  return {
    label: year.toString(),
    link: `/painting/${year}`,
  };
});

const sketchDropdown = [
  { label: "Pencil", link: `/sketch/pencil` },
  { label: "Ink", link: `/sketch/ink` },
];

const AppContent: React.FC = () => {
  const location = useLocation();

  // 👇 if we opened a modal, we saved the previous location here
  const state = location.state as { backgroundLocation?: Location } | null;
  const backgroundLocation = state?.backgroundLocation;

  const isHomepage = (backgroundLocation ?? location).pathname === "/";

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

      {/* ✅ Background routes:
          If a modal is open, render the "backgroundLocation" instead of the current one,
          so the painting page stays mounted (carousel position preserved). */}
      <Routes location={backgroundLocation ?? location}>
        <Route path="/" element={<HomeCarousel />} />

        {/* Normal painting page */}
        <Route path="/painting/:year" element={<ArtPage />} />

        {/* Direct-link support (if someone loads the overlay URL directly) */}
        <Route path="/painting/:year/:file" element={<ArtOverlayRoute />} />

        {/* Sketch page */}
        <Route path="/sketch/:type" element={<ArtPage />} />

        <Route path="/about" element={<div>About page coming soon</div>} />
      </Routes>

      {/* ✅ Modal routes:
          If backgroundLocation exists, also render the overlay on top. */}
      {backgroundLocation && (
        <Routes>
          <Route path="/painting/:year/:file" element={<ArtOverlayRoute />} />
        </Routes>
      )}
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