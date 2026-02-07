import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

interface DropdownItem {
  label: string;
  link: string;
}

interface DropdownProps {
  label: string;
  link?: string;
  items?: DropdownItem[];
}

const Dropdown: React.FC<DropdownProps> = ({ label, link, items = [] }) => {
  const location = useLocation(); 
  const isArtPage =
    location.pathname.startsWith("/painting") ||
    location.pathname.startsWith("/sketch");

  const dropcolour = isArtPage ? "black" : "white";
  const licolour = isArtPage ? "black" : "white";
  const fucklicolour = isArtPage ? "white" : "black";

  const [open, setOpen] = useState(false);

  const handleMouseEnter = () => setOpen(true);
  const handleMouseLeave = () => setOpen(false);
  const handleLinkClick = () => setOpen(false);

  return (
    <div
      className="dropdown"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {link ? (
        <Link className="menuitem" to={link} style={{ color: licolour }}>
          {label}
        </Link>
      ) : (
        <span className="menuitem" style={{ color: licolour }}>
          {label}
        </span>
      )}

      {items.length > 0 && open && (
        <div className="dropdown-content">
          <div
            className="dropdown-triangle"
            style={{ borderBottom: `10px solid ${dropcolour}` }}
          />
          <div className="dropdown-list" style={{ backgroundColor: dropcolour }}>
            <ul>
              {items.map((item, index) => (
                <li key={index} style={{ color: fucklicolour }}>
                  <Link
                    to={item.link}
                    style={{ color: fucklicolour }}
                    onClick={handleLinkClick} 
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;