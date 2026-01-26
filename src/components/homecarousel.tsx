import React, { useState, useEffect } from "react";
import artworksData from "../data/artworks.json";

// Load all images from folder
const artworkModules = import.meta.glob("../assets/bgimages/*.{png,jpg,jpeg,svg}", { eager: true });

// Build filename → actual image path map
const imageMap: Record<string, string> = {};
Object.entries(artworkModules).forEach(([path, mod]: any) => {
  const fileName = path.split("/").pop(); // e.g. "art1.jpg"
  imageMap[fileName!] = mod.default;
});

// Merge JSON metadata with real image paths
const artworks = artworksData.map((art: any) => ({
  ...art,
  src: imageMap[art.file],
}));

const HomeCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mouseX, setMouseX] = useState(window.innerWidth / 2);
  const [showButtons, setShowButtons] = useState(false);

  // -------- AUTO SLIDE --------
  useEffect(() => {
    if (!artworks.length) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % artworks.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // -------- MOUSE TRACKING --------
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setShowButtons(true);
    };

    const handleLeave = () => {
      setShowButtons(false);
    };

    window.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseleave", handleLeave);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  // -------- NAVIGATION --------
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + artworks.length) % artworks.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % artworks.length);
  };

  const isLeftSide = mouseX < window.innerWidth / 2;

  // -------- SCREEN CLICK HANDLER --------
  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const clickX = e.clientX;
    const screenMid = window.innerWidth / 2;

    if (clickX < screenMid) prevSlide();
    else nextSlide();
  };

  const currentArtwork = artworks[currentIndex];

  return (
    <div>
      <div className="carousel-container" onClick={handleScreenClick}>
        {artworks.map((art, index) => (
          <img
            key={index}
            src={art.src}
            alt={`carousel-${index}`}
            className={index === currentIndex ? "active" : ""}
          />
        ))}

        {/* LEFT BUTTON */}
        <button
          className={`carousel-btn left ${showButtons && isLeftSide ? "show" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
        >
          ‹
        </button>

        {/* RIGHT BUTTON */}
        <button
          className={`carousel-btn right ${showButtons && !isLeftSide ? "show" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
        >
          ›
        </button>
      </div>

      {/* METADATA LABEL */}
      <div className="backgroundtag">
        {currentArtwork?.type.toUpperCase()} / {currentArtwork?.year}
      </div>
    </div>
  );
};

export default HomeCarousel;