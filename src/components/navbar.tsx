import React from "react";
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


const NavBar: React.FC<NavBarProps> = ({
  artistName,
  dropdownItems,
  linkItems,
}) => {
  return (
    <nav className="navbar">

      <div className="navbar-left">{artistName}</div>

     
      <div className="navbar-right">
      
        {dropdownItems.map((item, index) => (
          <Dropdown
            key={`dropdown-${index}`}
            label={item.label}
            items={item.dropdown}
          />
        ))}

     
        {linkItems.map((item, index) => (
          <a
            key={`link-${index}`}
            href={item.link}
            className="nav-link"
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
};

export default NavBar;