import React, { useRef, useState, useEffect } from "react";
import artworksData from "../data/artworks.json";

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

  // Controls how many images are visible (for staggered fade)
  const [visibleCount, setVisibleCount] = useState(0);

  // ✅ Lightbox / overlay state
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [overlayIndex, setOverlayIndex] = useState(0);

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

  // ✅ Overlay controls
  const openOverlay = (index: number) => {
    setOverlayIndex(index);
    setIsOverlayOpen(true);
  };

  const closeOverlay = () => setIsOverlayOpen(false);

  const overlayNext = () => {
    setOverlayIndex((i) => Math.min(i + 1, images.length - 1));
  };

  const overlayPrev = () => {
    setOverlayIndex((i) => Math.max(i - 1, 0));
  };

  // Reset + trigger sequential fade when year changes
  useEffect(() => {
    setCurrentIndex(0);
    setVisibleCount(0);
    setIsOverlayOpen(false); // close overlay if year changes

    const container = containerRef.current;
    if (container) container.scrollTo({ left: 0 });

    images.forEach((_, index) => {
      setTimeout(() => {
        setVisibleCount((prevCount) => prevCount + 1);
      }, index * STAGGER_DELAY);
    });
  }, [year]);

  // ✅ Wheel triggers next / prev like buttons
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isThrottled = false;

    const handleWheel = (e: WheelEvent) => {
      // if overlay is open, don't hijack wheel here
      if (isOverlayOpen) return;

      e.preventDefault();
      if (isThrottled) return;

      if (e.deltaY > 0) next();
      else if (e.deltaY < 0) prev();

      isThrottled = true;
      setTimeout(() => (isThrottled = false), 400);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [currentIndex, images.length, isOverlayOpen]);

  // ✅ Keyboard controls for overlay (Esc closes, arrows navigate)
  useEffect(() => {
    if (!isOverlayOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeOverlay();
      if (e.key === "ArrowRight") overlayNext();
      if (e.key === "ArrowLeft") overlayPrev();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOverlayOpen, images.length]);

  // ✅ Prevent background scroll while overlay is open
  useEffect(() => {
    if (!isOverlayOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOverlayOpen]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setHoverSide(x < rect.width / 2 ? "left" : "right");
  };

  const handleMouseLeave = () => setHoverSide(null);

  const overlayArt = images[overlayIndex];

  return (
    <>
      {/* ✅ Overlay / Lightbox */}
      {isOverlayOpen && overlayArt && (
        <div
          onClick={closeOverlay}
          style={{
            position: "fixed",
            inset: 0,
            background: "#fff",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Close button (optional, top-right) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeOverlay();
            }}
            className="carousel-btn blackbut show"
            style={{
              position: "absolute",
              top: 20,
              right: 20,
            }}
            aria-label="Close"
            title="Close (Esc)"
          >
            ✕
          </button>

          {/* Prev (overlay) */}
          {overlayIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                overlayPrev();
              }}
              className="carousel-btn blackbut show"
              style={{
                position: "absolute",
                left: 20,
              }}
              aria-label="Previous image"
              title="Previous (←)"
            >
              ‹
            </button>
          )}

          {/* Next (overlay) */}
          {overlayIndex < images.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                overlayNext();
              }}
              className="carousel-btn blackbut show"
              style={{
                position: "absolute",
                right: 20,
              }}
              aria-label="Next image"
              title="Next (→)"
            >
              ›
            </button>
          )}

          {/* Image + meta */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(92vw, 1400px)",
              height: "min(84vh, 900px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <img
                src={overlayArt.src}
                alt={overlayArt.title}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            </div>

            <div style={{ marginTop: 10 }}>
              <div style={{ fontWeight: "bold" }}>{overlayArt.title}</div>
              <div style={{ fontSize: "0.9rem", color: "#555" }}>
                {overlayArt.medium}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Carousel */}
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
        {/* Prev Button */}
        {currentIndex > 0 && (
          <button
            onClick={prev}
            className={`carousel-btn blackbut ${
              hoverSide === "left" ? "show" : ""
            }`}
            style={{ left: 0 }}
          >
            ‹
          </button>
        )}

        {/* Carousel images */}
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
                  onClick={() => openOverlay(idx)}
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

                <div style={{ marginTop: "5px", fontWeight: "bold" }}>
                  {art.title}
                </div>
                <div style={{ fontSize: "0.9rem", color: "#555" }}>
                  {art.medium}
                </div>
              </div>
            );
          })}
        </div>

        {/* Next Button */}
        {currentIndex < images.length - 1 && (
          <button
            onClick={next}
            className={`carousel-btn blackbut ${
              hoverSide === "right" ? "show" : ""
            }`}
            style={{ right: 0, marginRight: "50px" }}
          >
            ›
          </button>
        )}
      </div>
    </>
  );
};

export default HorizontalCarousel;