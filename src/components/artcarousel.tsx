import React, { useRef, useState, useEffect } from "react";
import artworksData from "../data/artworks.json";
import { useNavigate, useLocation } from "react-router-dom";

interface Artwork {
  file: string;
  year: string;
  type: string;
  title: string;
  medium: string;
}

interface HorizontalCarouselProps {
  year: string;
}

const HorizontalCarousel: React.FC<HorizontalCarouselProps> = ({ year }) => {
  const navigate = useNavigate();
  const location = useLocation();


  const openOverlay = (artFile: string) => {
    navigate(`/painting/${year}/${encodeURIComponent(artFile)}`, {
      state: { backgroundLocation: location },
    });
  };

  const artworksForYear = artworksData.filter((art) => art.year === year);

  const modules = import.meta.glob("../assets/art/*.{png,jpg,jpeg,svg}", {
    eager: true,
  });

  const images = artworksForYear
    .map((art) => {
      const key = Object.keys(modules).find((path) => path.endsWith(art.file));
      return {
        ...art,
        src: key ? (modules[key] as any).default : null,
      };
    })
    .filter((x): x is Artwork & { src: string } => Boolean(x?.src));

  const containerRef = useRef<HTMLDivElement>(null);
  const imgContainerRefs = useRef<HTMLDivElement[]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoverSide, setHoverSide] = useState<"left" | "right" | null>(null);

  const [visibleCount, setVisibleCount] = useState(0);

  const gap = 20;
  const STAGGER_DELAY = 120;

  const scrollToIndex = (newIndex: number) => {
    const container = containerRef.current;
    const targetEl = imgContainerRefs.current[newIndex];
    if (!container || !targetEl) return;

    container.scrollTo({
      left: targetEl.offsetLeft,
      behavior: "smooth",
    });

    setCurrentIndex(newIndex);
  };

  const next = () => {
    if (currentIndex < images.length - 1) scrollToIndex(currentIndex + 1);
  };

  const prev = () => {
    if (currentIndex > 0) scrollToIndex(currentIndex - 1);
  };


  useEffect(() => {
    setCurrentIndex(0);
    setVisibleCount(0);

    const container = containerRef.current;
    if (container) container.scrollTo({ left: 0 });

    images.forEach((_, index) => {
      setTimeout(() => {
        setVisibleCount((prevCount) => prevCount + 1);
      }, index * STAGGER_DELAY);
    });
  }, [year]);


  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isThrottled = false;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isThrottled) return;

      if (e.deltaY > 0) next();
      else if (e.deltaY < 0) prev();

      isThrottled = true;
      setTimeout(() => (isThrottled = false), 400);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [currentIndex, images.length]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setHoverSide(x < rect.width / 2 ? "left" : "right");
  };

  const handleMouseLeave = () => setHoverSide(null);

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: "relative",
        width: "calc(100vw - 50px)",
        marginTop: "15vh",
        height: "60vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {currentIndex > 0 && (
        <button
          onClick={prev}
          className={`carousel-btn blackbut ${hoverSide === "left" ? "show" : ""}`}
          style={{ left: 0 }}
        >
          ‹
        </button>
      )}

      <div
        ref={containerRef}
        style={{
          display: "flex",
          height: "100%",
          gap: `${gap}px`,
          overflowX: "hidden",
        }}
      >
        {images.map((art, idx) => {
          const isLast = idx === images.length - 1;
          const isVisible = idx < visibleCount;

          return (
            <div
              key={idx}
              ref={(el) => {
                if (el) imgContainerRefs.current[idx] = el;
              }}
              className="carousel-item"
              style={{
                height: "100%",
                flexShrink: 0,
                width: isLast ? "calc(100vw - 50px)" : "auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "flex-start",
              }}
            >
              <img
                src={art.src}
                alt={art.title}
                onClick={() => openOverlay(art.file)}
                style={{
                  height: "80%",
                  objectFit: "contain",
                  cursor: "pointer",
                }}
                className={[
                  idx < currentIndex ? "fade-out" : "",
                  isVisible ? "fade-in" : "pre-fade",
                ].join(" ")}
                title="Click to view full size"
              />

              <div style={{ marginTop: "5px", fontWeight: "bold" }}>{art.title}</div>
              <div style={{ fontSize: "0.9rem", color: "#555" }}>{art.medium}</div>
            </div>
          );
        })}
      </div>

      {currentIndex < images.length - 1 && (
        <button
          onClick={next}
          className={`carousel-btn blackbut ${hoverSide === "right" ? "show" : ""}`}
          style={{ right: 0, marginRight: "50px" }}
        >
          ›
        </button>
      )}
    </div>
  );
};

export default HorizontalCarousel;