import React from "react";
import { Link, useLocation } from "react-router-dom";
import Dropdown from "./dropdown";

interface DropdownItem {
  label: string;
  dropdown: { label: string; link: string }[];
}

interface LinkItem {
  label: string;
  link: string;
}

interface NavBarProps {
  artistName: string;
  dropdownItems: DropdownItem[];
  linkItems: LinkItem[];
}

const NavBar: React.FC<NavBarProps> = ({ artistName, dropdownItems, linkItems }) => {
  const location = useLocation();

  const isArtPage = location.pathname.startsWith("/painting") || location.pathname.startsWith("/sketch");
  const navTextColor = isArtPage ? "black" : "white";

  return (
    <nav className="navbar" style={{ color: navTextColor }}>
      <div className="navbar-left">
        <Link to="/" className="home-link" style={{ color: navTextColor }}>
          {artistName}
        </Link>
      </div>

      <div className="navbar-right">
        {dropdownItems.map((item, index) => (
          <Dropdown
            key={`dropdown-${index}`}
            label={item.label}
            items={item.dropdown}
          />
        ))}

        {linkItems.map((item, index) => (
          <Link
            key={`link-${index}`}
            to={item.link}
            className="nav-link"
            style={{ color: navTextColor }}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default NavBar;