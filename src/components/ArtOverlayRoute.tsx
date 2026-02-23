import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import artworksData from "../data/artworks.json";

const modules = import.meta.glob("../assets/art/*.{png,jpg,jpeg,svg}", {
  eager: true,
});

const FADE_OUT_MS = 80; // fade old image out before swapping
const FADE_IN_MS = 300;  // fade in duration

export default function ArtOverlayRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const { year, file } = useParams<{ year: string; file: string }>();

  const decodedFile = decodeURIComponent(file ?? "");

  const images = useMemo(() => {
    const artworksForYear = artworksData.filter((a: any) => a.year === year);

    return artworksForYear
      .map((art: any) => {
        const key = Object.keys(modules).find((p) => p.endsWith(art.file));
        return {
          ...art,
          src: key ? (modules[key] as any).default : null,
        };
      })
      .filter((x: any) => Boolean(x?.src));
  }, [year]);

  const targetIndex = images.findIndex((a: any) => a.file === decodedFile);

  // what we actually render (lets us fade out before swapping)
  const [displayIndex, setDisplayIndex] = useState<number | null>(null);

  // controls opacity of the *image only*
  const [isVisible, setIsVisible] = useState(false);

  // helps us ignore late onLoad events from a previous image
  const loadTokenRef = useRef(0);

  const displayArtwork =
    displayIndex != null && displayIndex >= 0 && displayIndex < images.length
      ? images[displayIndex]
      : null;

  const close = () => navigate(-1);

  // use replace so next/prev don't stack history entries
  // preserve location.state so backgroundLocation stays attached
  const next = () => {
    if (targetIndex >= 0 && targetIndex < images.length - 1) {
      navigate(`/painting/${year}/${encodeURIComponent(images[targetIndex + 1].file)}`, {
        replace: true,
        state: location.state,
      });
    }
  };

  const prev = () => {
    if (targetIndex > 0) {
      navigate(`/painting/${year}/${encodeURIComponent(images[targetIndex - 1].file)}`, {
        replace: true,
        state: location.state,
      });
    }
  };

  // invalid URL fallback
  useEffect(() => {
    if (!year) return;
    if (images.length && targetIndex === -1) {
      navigate(`/painting/${year}`, { replace: true });
    }
  }, [targetIndex, images.length, year, navigate]);

  // ✅ handle switching which image is displayed (fade-out -> swap)
  useEffect(() => {
    if (targetIndex < 0) return;

    // first open
    if (displayIndex === null) {
      setDisplayIndex(targetIndex);
      setIsVisible(false); // wait for onLoad to fade in
      loadTokenRef.current += 1;
      return;
    }

    // same image
    if (displayIndex === targetIndex) return;

    // fade out current
    setIsVisible(false);

    const t = window.setTimeout(() => {
      // swap to new image (still hidden until it loads)
      setDisplayIndex(targetIndex);
      loadTokenRef.current += 1;
    }, FADE_OUT_MS);

    return () => window.clearTimeout(t);
  }, [targetIndex, displayIndex]);

  // Keyboard + scroll lock
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };

    window.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [targetIndex, year, images.length]);

  if (!displayArtwork) return null;

  return (
    <div
      
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
      <button
        onClick={(e) => {
          e.stopPropagation();
          close();
        }}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          fontSize: "2rem",
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
        aria-label="Close"
      >
        ✕
      </button>

      {targetIndex > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          style={{
            position: "absolute",
            left: 20,
            top: "50%",
            fontSize: "3rem",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
          aria-label="Previous"
        >
          ‹
        </button>
      )}

      {targetIndex < images.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          style={{
            position: "absolute",
            right: 20,
            top: "50%",
            fontSize: "3rem",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
          aria-label="Next"
        >
          ›
        </button>
      )}

      <img
        key={displayArtwork.file} // ✅ ensures onLoad fires reliably on swap
        src={displayArtwork.src}
        alt={displayArtwork.title}
        onLoad={() => {
          // Only show if this load corresponds to the current image
          const tokenAtLoad = loadTokenRef.current;

          // next frame so opacity change triggers transition
          requestAnimationFrame(() => {
            // if nothing changed since we scheduled, fade in
            if (tokenAtLoad === loadTokenRef.current) {
              setIsVisible(true);
            }
          });

          // fallback (some SVG/cached cases can be weird)
          setTimeout(() => {
            if (tokenAtLoad === loadTokenRef.current) setIsVisible(true);
          }, 30);
        }}
        style={{
          maxWidth: "90vw",
          maxHeight: "85vh",
          objectFit: "contain",
          opacity: isVisible ? 1 : 0,
          transition: `opacity ${FADE_IN_MS}ms ease`,
        }}
      />
    </div>
  );
}