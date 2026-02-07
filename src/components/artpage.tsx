import React from "react";
import { useParams } from "react-router-dom";
import HorizontalCarousel from "./artcarousel";

const ArtPage: React.FC = () => {

  const { year, type } = useParams<{ year?: string; type?: string }>();

  const displayValue = year || type || "";

  return (
    <div className="artpage-container">
      <div>{displayValue}</div>
      {year && <HorizontalCarousel year={year} />}
    </div>

    
  );
};

export default ArtPage;