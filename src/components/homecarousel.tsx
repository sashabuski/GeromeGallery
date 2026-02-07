import React, { useState, useEffect } from "react";
import artworksData from "../data/artworks.json";
import { Link } from "react-router-dom";

const artworkModules = import.meta.glob("../assets/bgimages/*.{png,jpg,jpeg,svg}", { eager: true });

const imageMap: Record<string, string> = {};
Object.entries(artworkModules).forEach(([path, mod]: any) => {
  const fileName = path.split("/").pop(); 
  imageMap[fileName!] = mod.default;
});

const artworks = artworksData.map((art: any) => ({
  ...art,
  src: imageMap[art.file],
}));

const HomeCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mouseX, setMouseX] = useState(window.innerWidth / 2);
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    if (!artworks.length) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % artworks.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + artworks.length) % artworks.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % artworks.length);
  };

  const isLeftSide = mouseX < window.innerWidth / 2;

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

      
        <button
          className={`carousel-btn left ${showButtons && isLeftSide ? "show" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
        >
          ‹
        </button>

    
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

      <Link
className="backgroundtag"
to={`/sketch/${currentArtwork?.year}`}
>
<span className="type">{currentArtwork?.type.toUpperCase()}</span> / {currentArtwork?.year}
</Link>
    </div>
  );
};

export default HomeCarousel;