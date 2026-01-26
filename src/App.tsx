import React from 'react';
import HomeCarousel from './components/homecarousel';
import NavBar from './components/navbar';
import './App.css';

// 🔥 Generate year dropdown (1840–1990)
const yearDropdown = Array.from(
  { length: 1900 - 1840 + 1 },
  (_, i) => {
    const year = 1840 + i;
    return {
      label: year.toString(),
      link: `#${year}`
    };
  }
);

const App: React.FC = () => {
  return (
    <div className="App">
      <HomeCarousel />
      
      <NavBar
        artistName="Jean-Léon Gérôme"
        dropdownItems={[
          {
            label: "PAINTING",
            dropdown: yearDropdown // ← now dynamic years
          },
          {
            label: "SKETCH",
            dropdown: [
              { label: "Pencil", link: "#pencil" },
              { label: "Ink", link: "#ink" }
            ]
          }]}
          linkItems={[
          {
            label: "ABOUT",
            link: "#about"
          }
        ]}
      />
      <div className="overlay" />
    </div>
  );
};

export default App;